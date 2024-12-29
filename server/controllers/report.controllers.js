import { uploadSingle } from "../middlewares/multer.middlewares.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { Report } from "../models/report.models.js";

dotenv.config();

export const uploadReport = async (req, res) => {
    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "File upload failed", error: err });
        }

        const filePath = path.resolve("./server/uploads", req.file?.filename);

        try {
            const fileBuffer = fs.readFileSync(filePath);

            const newReport = await Report.create({
                user: req.user.id,
                reportName: req.file.filename,
                fileType: req.file.mimetype,
                insights: req.body.insights || "",
            });

            res.status(200).json({
                message: "Report uploaded successfully",
                report: newReport,
            });
        } catch (error) {
            console.error("Error uploading report:", error);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
    });
};
