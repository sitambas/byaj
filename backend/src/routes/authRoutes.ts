import { Router } from 'express';
import { login, verify, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/verify', verify);
router.get('/me', authenticate, getMe);

export default router;

