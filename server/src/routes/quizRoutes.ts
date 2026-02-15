import { Router } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Result from '../models/Result';
import { generateQuestions } from '../controllers/quizController';

const router = Router();

// POST /api/quiz/generate
router.post('/generate', auth, generateQuestions);

// POST /api/quiz/submit
router.post('/submit', auth, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }

        const { role, difficulty, score, totalQuestions, answers } = req.body as {
            role?: string;
            difficulty?: string;
            score: number;
            totalQuestions: number;
            answers: any;
        };

        if (!role || !difficulty || typeof score !== 'number' || typeof totalQuestions !== 'number' || !answers) {
            res.status(400).json({ message: 'Invalid payload.' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        const result = await Result.create({
            userId: user._id,
            email: user.email,
            role: role.trim(),
            score,
            totalQuestions,
            answers,
        });

        res.status(201).json({ message: 'Result saved successfully.', resultId: result._id });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ message: 'Failed to submit quiz result.' });
    }
});

// GET /api/quiz/results
router.get('/results', auth, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }

        const results = await Result.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ results });
    } catch (error) {
        console.error('Fetch quiz results error:', error);
        res.status(500).json({ message: 'Failed to fetch quiz results.' });
    }
});

export default router;
