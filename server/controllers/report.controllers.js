import { uploadSingle } from "../middlewares/multer.middlewares.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { Report } from "../models/report.models.js";
import { User } from '../models/user.models.js'

dotenv.config();

export const uploadReport = async (req, res) => {
    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "File upload failed", error: err });
        }

        const filePath = path.resolve("./server/uploads", req.file?.filename);

        try {
            const fileBuffer = fs.readFileSync(filePath);

            const user = await User.findOne({email: req.user?.email})
            if(!user){
                return res.status(400).json({message: 'User not found'})
            } 
            const report = await Report.findOne({user: user._id})
            
            if(report) {
                const updatedReport = await Report.findOneAndUpdate({user: user._id},{
                    reportName: req.file.filename,
                    fileType: req.file.mimetype,
                    insights: req.body.insights || "",
                })

                return res.status(200).json({
                    message: "Report updated successfully",
                    report: updatedReport,
                });
            }

            const newReport = await Report.create({
                user: req.user.id,
                reportName: req.file.filename,
                fileType: req.file.mimetype,
                insights: req.body.insights || "",
            });

            return res.status(200).json({
                message: "Report uploaded successfully",
                report: newReport,
            });
        } catch (error) {
            console.error("Error uploading report:", error);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
    });
};
