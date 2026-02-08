import { Router } from 'express';
import { assignBranchesToUser, getUserBranches } from '../controllers/userBranchController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Assign branches to a user
router.post('/assign', authenticate, assignBranchesToUser);

// Get user's assigned branches
router.get('/user/:userId', authenticate, getUserBranches);
router.get('/me', authenticate, getUserBranches);

export default router;

