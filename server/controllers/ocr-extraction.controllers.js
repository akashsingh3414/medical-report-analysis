import PDFParser from 'pdf2json';
import { fromBuffer } from 'pdf2pic';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { User } from '../models/user.models.js';
import { Report } from '../models/report.models.js';
import Tesseract from 'tesseract.js';

class DocumentProcessor {
  async processImage(imageBuffer) {
    try {
      const result = await Tesseract.recognize(imageBuffer, 'eng');
      return {
        type: 'image',
        text: result.data.text,
        pageCount: 1,
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
          if (pdfData.Pages.length > 1) {
            reject(new Error('The PDF contains multiple pages. Only single-page PDFs are allowed.'));
          }

          const text = pdfData.Pages.map((page) =>
            page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(' ')
          ).join('\n\n');

          resolve({
            type: 'pdf',
            text: text,
            pageCount: pdfData.Pages.length,
            isScanned: false,
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
        format: 'png',
        width: 2480,
        height: 3508,
      };

      const convert = fromBuffer(pdfBuffer, options);
      const pages = await convert.bulk(-1, { outputdir: tempDir });

      if (pages.length > 1) {
        throw new Error('The PDF contains multiple pages. Only single-page PDFs are allowed.');
      }

      const imagePath = pages[0].path;
      const imageBuffer = await fs.readFile(imagePath);
      const result = await Tesseract.recognize(imageBuffer, 'eng');

      await fs.unlink(imagePath);
      await fs.rm(tempDir, { recursive: true, force: true });

      return {
        type: 'pdf',
        text: result.data.text,
        pageCount: 1,
        isScanned: true,
      };
    } catch (error) {
      throw new Error(`Failed to process scanned PDF: ${error.message}`);
    }
  }

  async processDocument(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);

      const isJPEG = fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8;
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
        error: error.message,
      };
    }
  }
}

export const analyzeMedicalReport = async (req, res) => {
  try {
    const processor = new DocumentProcessor();
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

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: 'Error processing document',
        error: result.error,
      });
    }

    const updateData = {
      ocrText: result.text || '',
      status: result.error ? 'failed' : 'processed',
    };

    await Report.findByIdAndUpdate(report._id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Document processed successfully',
      ocrText: result.text,
    });
  } catch (error) {
    console.error('Error in analyzeMedicalReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
