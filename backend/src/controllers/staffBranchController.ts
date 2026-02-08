import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Assign branches to a staff member
export const assignBranchesToStaff = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { staffUserId, branchIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!staffUserId || typeof staffUserId !== 'string') {
      return res.status(400).json({ error: 'Invalid staff user ID' });
    }

    if (!Array.isArray(branchIds)) {
      return res.status(400).json({ error: 'branchIds must be an array' });
    }

    // Verify the target user is actually a staff member
    const staff = await prisma.staff.findUnique({
      where: { userId: staffUserId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Only owners/admins can assign branches to staff
    // Check if requester is owner (has books) or admin
    const requesterStaff = await prisma.staff.findUnique({
      where: { userId },
      select: { roleName: true },
    });

    const requesterOwnsBooks = await prisma.book.findFirst({
      where: { userId },
    });

    if (!requesterOwnsBooks && (!requesterStaff || requesterStaff.roleName !== 'ADMIN')) {
      return res.status(403).json({ 
        error: 'Only owners and admins can assign branches to staff' 
      });
    }

    // Verify requester owns the branches they're trying to assign
    const validBranchIds = branchIds.filter((id): id is string => typeof id === 'string');
    const branches = await prisma.book.findMany({
      where: {
        id: { in: validBranchIds },
        OR: [
          { userId: userId }, // Requester owns the branch
          // Or allow if requester is admin (they can assign any branch)
        ],
      },
    });

    // If requester is not admin, they must own all branches
    if (!requesterStaff || requesterStaff.roleName !== 'ADMIN') {
      if (branches.length !== validBranchIds.length) {
        return res.status(403).json({ 
          error: 'You can only assign branches you own' 
        });
      }
    }

    // Remove existing assignments for this staff member
    await prisma.userBranchAccess.deleteMany({
      where: { userId: staffUserId },
    });

    // Create new assignments
    if (validBranchIds.length > 0) {
      await prisma.userBranchAccess.createMany({
        data: validBranchIds.map((bookId: string) => ({
          userId: staffUserId,
          bookId,
        })),
      });
    }

    // Get updated branch list
    const branchAccess = await prisma.userBranchAccess.findMany({
      where: { userId: staffUserId },
      include: {
        book: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: 'Branches assigned to staff successfully',
      staff: {
        id: staff.id,
        userId: staff.userId,
        name: staff.user.name,
        phone: staff.user.phone,
      },
      branches: branchAccess.map(access => ({
        id: access.book.id,
        name: access.book.name,
      })),
    });
  } catch (error: any) {
    console.error('Assign branches to staff error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get staff member's assigned branches
export const getStaffBranches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const paramStaffUserId = req.params?.staffUserId;
    const targetStaffUserId = (typeof paramStaffUserId === 'string' ? paramStaffUserId : null) || userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!targetStaffUserId || typeof targetStaffUserId !== 'string') {
      return res.status(400).json({ error: 'Invalid staff user ID' });
    }

    // Verify the target user is actually a staff member
    const staff = await prisma.staff.findUnique({
      where: { userId: targetStaffUserId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Get assigned branches
    const branchAccess = await prisma.userBranchAccess.findMany({
      where: { userId: targetStaffUserId },
      include: {
        book: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      staff: {
        id: staff.id,
        userId: staff.userId,
        name: staff.user.name,
        phone: staff.user.phone,
      },
      assignedBranches: branchAccess.map(access => ({
        id: access.book.id,
        name: access.book.name,
      })),
    });
  } catch (error: any) {
    console.error('Get staff branches error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

