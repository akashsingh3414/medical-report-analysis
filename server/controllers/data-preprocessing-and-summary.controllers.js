import { GoogleGenerativeAI } from "@google/generative-ai";
import { Report } from "../models/report.models.js";
import { User } from "../models/user.models.js";
import fs from "fs";
import path from "path";

function cleanText(rawText) {
    return rawText
        .replace(/\n/g, " ")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([.,])/g, "$1")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
        .trim();
}

const AI_MODEL = "gemini-pro";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });

export const cleanDataAndSummarizeReport = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const report = await Report.findOne({ user: user._id });
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const ocrText = report.ocrText.toString();
        const cleanedText = cleanText(ocrText);

        if (!cleanedText) {
            return res.status(400).json({ message: "Cleaned data not available" });
        }

        const prompt = `
        Analyze the following blood report data and provide detailed insights in a fixed JSON format for easier parsing. Ensure the analysis is comprehensive, informative, and adaptable to various types of blood tests.
        
        ### Key Information to Include:
        1. **Detailed Anomalies Analysis**:
           - Highlight any detected anomalies in the test results.
           - Explain potential causes for these anomalies.
           - Provide a severity rating (Low/Medium/High) based on medical significance.
        2. **Personalized Health Suggestions**:
           - Offer tailored health improvement suggestions derived from the report data.
           - Focus on practical, actionable advice for better health outcomes.
        3. **Critical Findings and Warnings**:
           - Identify any critical findings that require urgent attention.
           - Specify the urgency level (Low/Medium/High).
           - Recommend appropriate actions for the findings.
        4. **Follow-Up Recommendations**:
           - Suggest additional tests or medical procedures for further investigation.
           - Clearly justify the reasons for each recommendation.
        5. **Summary of Key Findings**:
           - Provide a concise summary of the main insights from the report.
        
        ### **Guidelines for the Analysis**:
        - Only use data explicitly available in the report.
        - Do not infer or assume medical conditions not supported by the provided data.
        - Ensure the language is patient-friendly and non-technical wherever possible.
        
        ### **Response Format (Fixed JSON)**:
        {
          "anomalies_analysis": [
            {
              "anomaly": "Describe the anomaly",
              "potential_causes": ["Cause 1", "Cause 2"],
              "severity": "Low/Medium/High"
            }
          ],
          "personalized_suggestions": [
            {
              "suggestion": "Provide actionable health advice"
            }
          ],
          "critical_findings": [
            {
              "finding": "Describe the critical finding",
              "urgency": "Low/Medium/High",
              "action_required": "Recommended action to address the finding"
            }
          ],
          "follow_up_recommendations": [
            {
              "test_or_procedure": "Name of the test/procedure",
              "reason": "Why this is recommended"
            }
          ],
          "summary": {
            "key_findings": "A brief summary of the main insights"
          }
        }
        
        ### **Error Handling**:
        - If the report data is empty, invalid, or lacks measurable values:
        {
          "error": "The provided report data is empty or invalid. Unable to generate insights."
        }
        
        **Report Data**:
        ${cleanedText}
        
        ### **Additional Notes**:
        - Ensure flexibility to analyze any type of blood report data.
        - Maintain consistency in formatting and clarity in descriptions.
        - Avoid technical jargon unless necessary and provide explanations where applicable.
        `;        

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
                status: "completed",
                cleanData: cleanedText,
                insights: analysis,
            });

            return res.status(200).json({
                message: "Analysis completed successfully",
                analysis,
            });
        } catch (error) {
            console.error("Error parsing AI response as JSON:", error.message);
            return res.status(500).json({
                message:
                    "Error processing AI response. Please ensure the data is formatted correctly.",
            });
        }
    } catch (error) {
        console.error("Error analyzing medical report:", error.message);
        return res.status(500).json({
            message: "Server error. Unable to process the request at the moment.",
        });
    }
};
