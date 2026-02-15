import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import quizRoutes from './routes/quizRoutes';
import auth from './middleware/auth';
import { getProfile } from './controllers/authController';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/quiz', quizRoutes);
app.get('/api/user/profile', auth, getProfile);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'HireReady API is running 🚀' });
});

// Connect to database and start server
const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`🚀 HireReady server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use. Please use a different port or stop the existing process.`);
            process.exit(1);
        } else {
            console.error('❌ Server error:', err);
        }
    });
};

startServer();
