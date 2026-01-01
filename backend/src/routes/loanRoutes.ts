import { Router } from 'express';
import {
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  recordPayment,
} from '../controllers/loanController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllLoans);
router.get('/:id', authenticate, getLoanById);
router.post('/', authenticate, createLoan);
router.put('/:id', authenticate, updateLoan);
router.delete('/:id', authenticate, deleteLoan);
router.post('/:id/payments', authenticate, recordPayment);

export default router;

