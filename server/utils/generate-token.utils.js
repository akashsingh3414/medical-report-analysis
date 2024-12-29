import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
    const secretKey = process.env.JWT_SECRET; // Secure secret key
    return jwt.sign(
        { id: user._id, email: user.email }, // Payload
        secretKey, // Secret key
        { expiresIn: '1h' } // Access token expires in 1 hour
    );
};

export const generateRefreshToken = (user) => {
    const secretKey = process.env.JWT_SECRET_REFRESH; // Separate secret key for refresh tokens
    return jwt.sign(
        { id: user._id }, // Minimal payload
        secretKey, // Secret key
        { expiresIn: '7d' } // Refresh token expires in 7 days
    );
};
