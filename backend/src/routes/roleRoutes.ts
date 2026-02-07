import { Router } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAvailableModules,
} from '../controllers/roleController';
import { authenticate } from '../middleware/auth';
import { requireOwnerOrAdmin } from '../middleware/permissions';

const router = Router();

// Get available modules (any authenticated user)
router.get('/modules', authenticate, getAvailableModules);

// Get all roles (owner/admin only)
router.get('/', authenticate, requireOwnerOrAdmin, getAllRoles);

// Get role by ID (owner/admin only)
router.get('/:id', authenticate, requireOwnerOrAdmin, getRoleById);

// Create role (owner/admin only)
router.post('/', authenticate, requireOwnerOrAdmin, createRole);

// Update role (owner/admin only)
router.put('/:id', authenticate, requireOwnerOrAdmin, updateRole);

// Delete role (owner/admin only)
router.delete('/:id', authenticate, requireOwnerOrAdmin, deleteRole);

export default router;

