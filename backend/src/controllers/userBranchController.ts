import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Assign branches to a user
export const assignBranchesToUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { targetUserId, branchIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!targetUserId || typeof targetUserId !== 'string') {
      return res.status(400).json({ error: 'Invalid target user ID' });
    }

    if (!Array.isArray(branchIds)) {
      return res.status(400).json({ error: 'branchIds must be an array' });
    }

    // Only owners can assign branches (users who created the branches)
    // Check if the requesting user is the owner of all branches
    if (targetUserId !== userId) {
      // If assigning to another user, verify requester is owner of those branches
      const validBranchIds = branchIds.filter((id): id is string => typeof id === 'string');
      const branches = await prisma.book.findMany({
        where: {
          id: { in: validBranchIds },
          userId: userId, // Only allow if requester owns the branches
        },
      });

      if (branches.length !== validBranchIds.length) {
        return res.status(403).json({ 
          error: 'You can only assign branches you own' 
        });
      }
    }

    // Remove existing assignments
    await prisma.userBranchAccess.deleteMany({
      where: { userId: targetUserId },
    });

    // Create new assignments
    if (branchIds.length > 0) {
      const validBranchIds = branchIds.filter((id): id is string => typeof id === 'string');
      
      if (validBranchIds.length > 0) {
        await prisma.userBranchAccess.createMany({
          data: validBranchIds.map((bookId: string) => ({
            userId: targetUserId,
            bookId,
          })),
        });
      }
    }

    // Get updated branch list
    const branchAccess = await prisma.userBranchAccess.findMany({
      where: { userId: targetUserId },
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
      message: 'Branches assigned successfully',
      branches: branchAccess.map(access => ({
        id: access.book.id,
        name: access.book.name,
      })),
    });
  } catch (error: any) {
    console.error('Assign branches error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get user's assigned branches
export const getUserBranches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const paramUserId = req.params?.userId;
    const targetUserId = (typeof paramUserId === 'string' ? paramUserId : null) || userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!targetUserId || typeof targetUserId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get assigned branches
    const branchAccess = await prisma.userBranchAccess.findMany({
      where: { userId: targetUserId },
      include: {
        book: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get owned books
    const ownedBooks = await prisma.book.findMany({
      where: { userId: targetUserId },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({
      assignedBranches: branchAccess.map(access => ({
        id: access.book.id,
        name: access.book.name,
      })),
      ownedBranches: ownedBooks,
    });
  } catch (error: any) {
    console.error('Get user branches error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
