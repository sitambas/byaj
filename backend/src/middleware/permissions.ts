import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from './auth';

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export interface PermissionRequest extends AuthRequest {
  userRole?: Role;
  isOwner?: boolean;
}

/**
 * Check if user has required role
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's staff record to check role
      const staff = await prisma.staff.findUnique({
        where: { userId },
        select: { roleName: true, roleId: true },
      });

      // If user is not staff, they are the owner (has all permissions)
      if (!staff) {
        req.userRole = 'ADMIN' as Role;
        req.isOwner = true;
        return next();
      }

      const userRole = staff.roleName as Role;
      req.userRole = userRole;
      req.isOwner = false;

      // Check if user has required role
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `This action requires one of: ${allowedRoles.join(', ')}`,
        });
      }

      next();
    } catch (error: any) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Check if user is owner or has admin role
 */
export const requireOwnerOrAdmin = requireRole('ADMIN');

/**
 * Check if user is owner, admin, or manager
 */
export const requireManagerOrAbove = requireRole('ADMIN', 'MANAGER');

