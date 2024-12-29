import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { generateAccessToken } from '../utils/generate-token.utils.js';

export const authenticateUser = async (req, res, next) => {
    const accessToken = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies

    if (!refreshToken) {
        return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    
    if (!accessToken) {
        return res.status(401).json({ message: "Access token required" });
    }

    try {
        // Verify the access token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to the request
        return next(); // Proceed with the request
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Access token has expired, attempt to use refresh token

            try {
                // Verify the refresh token
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
                const user = await User.findById(decodedRefresh.id);

                if (!user || user.refreshToken !== refreshToken) {
                    return res.status(403).json({ message: "Invalid refresh token. Please log in again." });
                }

                // Generate a new access token
                const newAccessToken = generateAccessToken(user);
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);

                req.user = jwt.verify(newAccessToken, process.env.JWT_SECRET); // Attach new token data to the request
                return next(); // Proceed with the request
            } catch (refreshError) {
                return res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
            }
        }

        return res.status(403).json({ message: "Invalid token. Please log in again." });
    }
};
