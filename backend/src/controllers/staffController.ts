import { Response } from 'express';
import prisma from '../config/database';
import { PermissionRequest } from '../middleware/permissions';

export const getAllStaff = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only owner/admin can view all staff
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get all staff members
    const staffMembers = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      staff: staffMembers.map((s) => ({
        id: s.id,
        userId: s.userId,
        roleId: s.roleId,
        roleName: s.roleName,
        role: s.role ? {
          id: s.role.id,
          name: s.role.name,
          permissions: s.role.permissions ? JSON.parse(s.role.permissions) : [],
        } : null,
        permissions: s.permissions ? JSON.parse(s.permissions) : null,
        phone: s.user.phone,
        name: s.user.name,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getStaffById = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    // Only owner/admin can view staff details
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        roleId: staff.roleId,
        roleName: staff.roleName,
        role: staff.role ? {
          id: staff.role.id,
          name: staff.role.name,
          permissions: staff.role.permissions ? JSON.parse(staff.role.permissions) : [],
        } : null,
        permissions: staff.permissions ? JSON.parse(staff.permissions) : null,
        phone: staff.user.phone,
        name: staff.user.name,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createStaff = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { phone, name, roleId, roleName, permissions } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only owner/admin can create staff
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    // Validate role - either roleId (custom role) or roleName (system role)
    let finalRoleId: string | null = null;
    let finalRoleName: string = 'STAFF';
    let finalPermissions: string | null = null;

    if (roleId) {
      // Using custom role
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        return res.status(400).json({ error: 'Role not found' });
      }
      finalRoleId = roleId;
      finalRoleName = role.name;
      // Use role permissions as default, can be overridden by permissions param
      finalPermissions = permissions ? JSON.stringify(permissions) : role.permissions;
    } else if (roleName) {
      // Using system role (backward compatibility)
      const allowedRoles = ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];
      if (!allowedRoles.includes(roleName)) {
        return res.status(400).json({
          error: 'Invalid role',
          message: `Role must be one of: ${allowedRoles.join(', ')}`,
        });
      }
      finalRoleName = roleName;
      // For system roles, use permissions if provided
      if (permissions) {
        finalPermissions = JSON.stringify(permissions);
      }
    } else {
      return res.status(400).json({ error: 'Either roleId or roleName is required' });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          name: name || null,
        },
      });
    } else {
      // Check if user is already a staff member
      const existingStaff = await prisma.staff.findUnique({
        where: { userId: user.id },
      });

      if (existingStaff) {
        return res.status(400).json({ error: 'User is already a staff member' });
      }
    }

    // Create staff record
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        roleId: finalRoleId,
        roleName: finalRoleName,
        permissions: finalPermissions,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    res.status(201).json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        roleId: staff.roleId,
        roleName: staff.roleName,
        role: staff.role ? {
          id: staff.role.id,
          name: staff.role.name,
          permissions: staff.role.permissions ? JSON.parse(staff.role.permissions) : [],
        } : null,
        permissions: staff.permissions ? JSON.parse(staff.permissions) : null,
        phone: staff.user.phone,
        name: staff.user.name,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateStaff = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { roleId, roleName, permissions, name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    // Only owner/admin can update staff
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const existingStaff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true, role: true },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Prepare update data
    const updateData: any = {};

    if (roleId !== undefined) {
      if (roleId) {
        // Using custom role
        const role = await prisma.role.findUnique({
          where: { id: roleId },
        });
        if (!role) {
          return res.status(400).json({ error: 'Role not found' });
        }
        updateData.roleId = roleId;
        updateData.roleName = role.name;
      } else {
        // Remove role assignment
        updateData.roleId = null;
      }
    } else if (roleName !== undefined) {
      // Using system role (backward compatibility)
      const allowedRoles = ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];
      if (!allowedRoles.includes(roleName)) {
        return res.status(400).json({
          error: 'Invalid role',
          message: `Role must be one of: ${allowedRoles.join(', ')}`,
        });
      }
      updateData.roleId = null; // Clear custom role
      updateData.roleName = roleName;
    }

    if (permissions !== undefined) {
      if (permissions === null || permissions.length === 0) {
        updateData.permissions = null;
      } else {
        if (!Array.isArray(permissions)) {
          return res.status(400).json({ error: 'Permissions must be an array' });
        }
        updateData.permissions = JSON.stringify(permissions);
      }
    }

    // Update staff
    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: staff.userId },
        data: { name: name || null },
      });
    }

    // Refresh staff data after user update
    const updatedStaff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    res.json({
      staff: {
        id: updatedStaff!.id,
        userId: updatedStaff!.userId,
        roleId: updatedStaff!.roleId,
        roleName: updatedStaff!.roleName,
        role: updatedStaff!.role ? {
          id: updatedStaff!.role.id,
          name: updatedStaff!.role.name,
          permissions: updatedStaff!.role.permissions ? JSON.parse(updatedStaff!.role.permissions) : [],
        } : null,
        permissions: updatedStaff!.permissions ? JSON.parse(updatedStaff!.permissions) : null,
        phone: updatedStaff!.user.phone,
        name: name !== undefined ? name : updatedStaff!.user.name,
        createdAt: updatedStaff!.createdAt,
        updatedAt: updatedStaff!.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteStaff = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    // Only owner/admin can delete staff
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const existingStaff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Prevent deleting yourself
    if (existingStaff.userId === userId) {
      return res.status(400).json({ error: 'Cannot delete your own staff account' });
    }

    await prisma.staff.delete({
      where: { id: staffId },
    });

    res.json({ message: 'Staff deleted successfully' });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getMyStaffInfo = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    res.json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        roleId: staff.roleId,
        roleName: staff.roleName,
        role: staff.role ? {
          id: staff.role.id,
          name: staff.role.name,
          permissions: staff.role.permissions ? JSON.parse(staff.role.permissions) : [],
        } : null,
        permissions: staff.permissions ? JSON.parse(staff.permissions) : null,
        phone: staff.user.phone,
        name: staff.user.name,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get my staff info error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

