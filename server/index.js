import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import reportRouter from './routes/report.routes.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config()

const app = express();

app.use(express());
app.use(express.json());
app.use(cookieParser())

const __dirname = path.resolve();

const mongodburl = process.env.MONGODB_URI;

mongoose.connect(mongodburl, {
    ssl: true,
    tlsInsecure: false
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

app.use('/api/user', userRouter);
app.use('/api/report', reportRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, (error) => {
   if (!error) {
    console.log(`server is running on port ${PORT}`)
   } else 
        console.log("Error occurred, server can't start", error);
    }
)