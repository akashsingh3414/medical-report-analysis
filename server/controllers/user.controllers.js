import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/generate-token.utils.js";
import { Report } from "../models/report.models.js"

export const register = async (req, res) => {
    const { email, password, fullName, mobileNo, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword || !fullName || !mobileNo) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    if (password !== confirmPassword ) {
        return res.status(400).json({ message: "Passwords do not match "});
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            fullName,
            mobileNo
        });

        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        newUser.refreshToken = refreshToken;
        await newUser.save();

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set secure flag in production
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(200).json({ message: "User registered successfully", user: userResponse, token: accessToken });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error occurred" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.status(200).json({ message: "Login successful", user: userResponse, token: accessToken });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error occurred" });
    }
};

export const logout = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.body._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    };

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);

    return res.status(200).json({ message: "User logged out" });
};

export const deleteUser = async (req, res) => {
   try {
    const user = await User.findOne({ email: req.user?.email })
    if(!user) {
    return res.status(400).json({message: "No user found to delete"})
    }
 
    await Report.deleteOne({user: user._id})
    
    await User.findByIdAndDelete(
        user._id,
        { $set: { refreshToken: null } },
    );

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ message: "User deleted" });
   } catch (error) {
        return res.status(400).json({message: "Internal server error. Couldn't delete user"})
   }    
}