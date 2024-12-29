import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true,
        unique: true
    },
    fullName: {
        type: String, 
        required: true,
    },
    mobileNo: {
        type: Number, 
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
    }, 
    refreshToken: {
        type: String,
    }
}, {timestamps: true})

export const User = mongoose.model("User", userSchema)