import express from 'express';
import { authenticate } from '../middleware/auth';
import { getInterestReport, getTransactionReport, getPartyStatement, getAccountSummary } from '../controllers/reportController';

const router = express.Router();

router.get('/interest', authenticate, getInterestReport);
router.get('/transaction', authenticate, getTransactionReport);
router.get('/party-statement', authenticate, getPartyStatement);
router.get('/account-summary', authenticate, getAccountSummary);

export default router;

