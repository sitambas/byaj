import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { PermissionRequest } from './permissions';

/**
 * Check if user has access to a specific module
 */
export const requireModule = (moduleId: string) => {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user is owner (not in Staff table) - owners have all permissions
      const staff = await prisma.staff.findUnique({
        where: { userId },
        include: {
          role: {
            select: {
              permissions: true,
            },
          },
        },
      });

      // If user is not in Staff table, they are the owner (has all permissions)
      if (!staff) {
        req.isOwner = true;
        req.userRole = 'ADMIN' as any;
        return next();
      }

      // Set isOwner flag for consistency
      req.isOwner = false;

      // Check custom permissions first (override role permissions)
      let hasPermission = false;
      
      if (staff.permissions) {
        const customPermissions = JSON.parse(staff.permissions);
        hasPermission = Array.isArray(customPermissions) && customPermissions.includes(moduleId);
      }

      // If no custom permissions or module not in custom permissions, check role permissions
      if (!hasPermission && staff.role?.permissions) {
        const rolePermissions = JSON.parse(staff.role.permissions);
        hasPermission = Array.isArray(rolePermissions) && rolePermissions.includes(moduleId);
      }

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `Access to ${moduleId} module is required`,
        });
      }

      next();
    } catch (error: any) {
      console.error('Module permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

