import { GoogleGenerativeAI } from "@google/generative-ai";
import { Report } from "../models/report.models.js";
import { User } from "../models/user.models.js";
import fs from 'fs'
import path from "path";

function cleanText(rawText) {
    return rawText
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([.,])/g, '$1')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .trim();
}

export const preprocessAndStoreText = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const report = await Report.findOne({ user: user._id });
        if (!report) return res.status(404).json({ message: "Report not found" });

        const ocrText = report.ocrText.toString();
        const cleanedText = cleanText(ocrText);

        await Report.findByIdAndUpdate(
            report._id,
            { cleanData: cleanedText },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Data cleaned successfully", cleanedText });
    } catch (error) {
        console.error("Error storing cleaned data:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const AI_MODEL = "gemini-pro";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });

export const analyzeMedicalReport = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const report = await Report.findOne({ user: user._id });
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const cleanedText = report.cleanData;
        if (!cleanedText) {
            return res.status(400).json({ message: "Cleaned data not available" });
        }

        const prompt = `
Analyze the following medical report and provide:
1. Detailed analysis of anomalies, including possible causes and severity.
2. Personalized health improvement suggestions based on the report data.
3. Any potential warning signs or critical findings that need urgent attention.
4. A list of recommended follow-up tests or medical procedures.
5. A summary of key findings.

Report Data:
${cleanedText}

Format the response as a JSON object.`;

        const results = await aiModel.generateContent(prompt);

        let responseText = results.response.text();
        responseText = responseText.replace(/```json\n?|\n?```/g, "").trim();

        try {
            const analysis = JSON.parse(responseText);

            const filePath = path.resolve(`./server/uploads/${report.reportName}`);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            await Report.findByIdAndUpdate(report._id, {
                status: 'completed',
                insights: analysis
            })

            return res.status(200).json({
                message: "Analysis completed successfully",
                analysis,
            });
        } catch (error) {
            console.error("Error parsing AI response as JSON:", error.message);
            return res.status(500).json({
                message: "Error processing AI response. Please ensure the data is formatted correctly.",
            });
        }
    } catch (error) {
        console.error("Error analyzing medical report:", error.message);
        return res.status(500).json({
            message: "Server error. Unable to process the request at the moment.",
        });
    }
};
