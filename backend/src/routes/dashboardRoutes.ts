import { Router } from 'express';
import { getSummary, getCharts, getDueLoans } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/summary', authenticate, getSummary);
router.get('/charts', authenticate, getCharts);
router.get('/due-loans', authenticate, getDueLoans);

export default router;

