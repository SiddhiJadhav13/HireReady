import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
    });
};

// Helper to build user response object
const buildUserResponse = (user: any) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    hasResume: !!user.resumeText,
    extractedSkills: user.extractedSkills || [],
    selectedRole: user.selectedRole || '',
    programmingLanguages: user.programmingLanguages || [],
    matchedRoles: user.matchedRoles || [],
});

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists.' });
            return;
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            message: 'Account created successfully.',
            token,
            user: buildUserResponse(user),
        });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            res.status(400).json({ message: messages.join(', ') });
            return;
        }
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: buildUserResponse(user),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/auth/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json({
            user: {
                ...buildUserResponse(user),
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/auth/set-role
export const setRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { selectedRole } = req.body as { selectedRole?: string };
        if (!selectedRole || !selectedRole.trim()) {
            res.status(400).json({ message: 'selectedRole is required.' });
            return;
        }

        const userId = req.user?.id || req.userId;
        const user = await User.findByIdAndUpdate(
            userId,
            { selectedRole: selectedRole.trim() },
            { new: true }
        );

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json({ message: 'Role updated.', selectedRole: user.selectedRole });
    } catch (error) {
        console.error('Set role error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
