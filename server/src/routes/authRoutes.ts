import { Router } from 'express';
import { signup, login, getProfile, setRole } from '../controllers/authController';
import auth from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.get('/me', auth, getProfile);
router.post('/set-role', auth, setRole);

export default router;
