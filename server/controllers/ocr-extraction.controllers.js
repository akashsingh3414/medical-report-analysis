import { HfInference } from '@huggingface/inference';
import { createCanvas, loadImage } from 'canvas';
import PDFParser from 'pdf2json';
import { fromBuffer } from 'pdf2pic';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { User } from '../models/user.models.js';
import { Report } from '../models/report.models.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiToken = process.env.HUGGING_FACE_ACCESS_TOKEN;
const AI_MODEL = "gemini-pro";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });

class DocumentProcessor {
  constructor(apiToken) {
    this.hf = new HfInference(apiToken);
  }

  async processImage(imageBuffer) {
    try {
      const image = await loadImage(imageBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      const base64Image = canvas.toDataURL('image/png').split(',')[1];

      const result = await this.hf.imageToText({
        model: 'microsoft/trocr-base-handwritten',
        data: Buffer.from(base64Image, 'base64')
      });

      return {
        type: 'image',
        text: result.text,
        pageCount: 1
      };
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  async processTextPDF(pdfBuffer) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          const text = pdfData.Pages.map(page => {
            return page.Texts.map(text => decodeURIComponent(text.R[0].T)).join(' ');
          }).join('\n\n=== Page Break ===\n\n');

          resolve({
            type: 'pdf',
            text: text,
            pageCount: pdfData.Pages.length,
            isScanned: false
          });
        } catch (error) {
          reject(new Error(`Failed to parse PDF content: ${error.message}`));
        }
      });

      pdfParser.on('pdfParser_dataError', (error) => {
        reject(new Error(`Failed to parse PDF: ${error}`));
      });

      pdfParser.parseBuffer(pdfBuffer);
    });
  }

  async processScannedPDF(pdfBuffer) {
    try {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-'));
      
      const options = {
        density: 300,
        format: "png",
        width: 2480,
        height: 3508
      };

      const convert = fromBuffer(pdfBuffer, options);
      let pageTexts = [];
      let pageCount = 0;

      try {
        const pages = await convert.bulk(-1, { outputdir: tempDir });
        pageCount = pages.length;

        for (let i = 0; i < pages.length; i++) {
          const imagePath = pages[i].path;
          const imageBuffer = await fs.readFile(imagePath);
          const result = await this.hf.imageToText({
            model: 'microsoft/trocr-base-handwritten',
            data: imageBuffer
          });
          pageTexts.push(result.text);
          
          await fs.unlink(imagePath);
        }
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }

      return {
        type: 'pdf',
        text: pageTexts.join('\n\n=== Page Break ===\n\n'),
        pageCount: pageCount,
        isScanned: true
      };
    } catch (error) {
      throw new Error(`Failed to process scanned PDF: ${error.message}`);
    }
  }

  async processDocument(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);

      const isJPEG = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
      const isPNG = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50;
      const isPDF = fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50;

      if (isJPEG || isPNG) {
        return await this.processImage(fileBuffer);
      }
      
      if (isPDF) {
        const textResult = await this.processTextPDF(fileBuffer);
        
        if (!textResult.text.trim() || textResult.text.trim().length < 50) {
          return await this.processScannedPDF(fileBuffer);
        }
        
        return textResult;
      }

      throw new Error('Unsupported file type');
    } catch (error) {
      return {
        error: error.message
      };
    }
  }
}

export const analyseReport = async (req, res) => {
  try {
    if (!apiToken) {
      throw new Error('Hugging Face API token not configured');
    }

    const processor = new DocumentProcessor(apiToken);
    const user = await User.findOne({ email: req.user.email }).select('-refreshToken -password');
    const report = await Report.findOne({ user: user._id });

    if (!report) {
      return res.status(400).json({
        success: false,
        message: 'Report not found',
      });
    }

    const filePath = path.resolve(`./server/uploads/${report.reportName}`);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'File not found on server',
      });
    }

    const result = await processor.processDocument(filePath);

    const updateData = {
      ocrText: result.text || '',
      status: result.error ? 'failed' : 'processed',
    };

    await Report.findByIdAndUpdate(report._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: 'Error processing document',
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Document processed successfully',
      ocrText: result.text,
    });
  } catch (error) {
    console.error('Error in analyseReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
