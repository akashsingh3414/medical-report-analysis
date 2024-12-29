import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        required: true
    },
    ocrText: {
        type: String,
    },
    cleanData: {
        type: String,
    },
    insights: {
        type: mongoose.Schema.Types.Mixed,
    },
    summary: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed', 'completed'],
        default: 'pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export const Report = mongoose.model("Report", reportSchema);
