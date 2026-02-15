import { Router } from 'express';
import { upload, uploadResume, getResumeText, downloadResume } from '../controllers/resumeController';
import auth from '../middleware/auth';

const router = Router();

// All routes are protected
router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/text', auth, getResumeText);
router.get('/download', auth, downloadResume);

export default router;
