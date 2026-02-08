import { Router } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getMyStaffInfo,
} from '../controllers/staffController';
import { assignBranchesToStaff, getStaffBranches } from '../controllers/staffBranchController';
import { authenticate } from '../middleware/auth';
import { requireOwnerOrAdmin } from '../middleware/permissions';

const router = Router();

// Get current user's staff info (any authenticated user)
router.get('/me', authenticate, getMyStaffInfo);

// Get all staff (owner/admin only)
router.get('/', authenticate, requireOwnerOrAdmin, getAllStaff);

// Get staff by ID (owner/admin only)
router.get('/:id', authenticate, requireOwnerOrAdmin, getStaffById);

// Create staff (owner/admin only)
router.post('/', authenticate, requireOwnerOrAdmin, createStaff);

// Update staff (owner/admin only)
router.put('/:id', authenticate, requireOwnerOrAdmin, updateStaff);

// Delete staff (owner/admin only)
router.delete('/:id', authenticate, requireOwnerOrAdmin, deleteStaff);

// Staff branch assignment routes
router.post('/:staffUserId/branches', authenticate, requireOwnerOrAdmin, assignBranchesToStaff);
router.get('/:staffUserId/branches', authenticate, getStaffBranches);

export default router;

