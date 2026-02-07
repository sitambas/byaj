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
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      staff: staffMembers.map((s) => ({
        id: s.id,
        userId: s.userId,
        role: s.role,
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
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        role: staff.role,
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
    const { phone, name, role } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only owner/admin can create staff
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!phone || !role) {
      return res.status(400).json({ error: 'Phone and role are required' });
    }

    const allowedRoles = ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: `Role must be one of: ${allowedRoles.join(', ')}`,
      });
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
        role,
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
      },
    });

    res.status(201).json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        role: staff.role,
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
    const { role, name } = req.body;

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
      include: { user: true },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Prepare update data
    const updateData: any = {};

    if (role) {
      const allowedRoles = ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          message: `Role must be one of: ${allowedRoles.join(', ')}`,
        });
      }
      updateData.role = role;
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
      },
    });

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: staff.userId },
        data: { name: name || null },
      });
    }

    res.json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        role: staff.role,
        phone: staff.user.phone,
        name: name !== undefined ? name : staff.user.name,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
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
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    res.json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        role: staff.role,
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

