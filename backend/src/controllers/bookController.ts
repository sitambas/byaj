import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllBooks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's assigned branch IDs
    const branchAccess = await prisma.userBranchAccess.findMany({
      where: { userId },
      select: { bookId: true },
    });
    const assignedBranchIds = branchAccess.map(access => access.bookId);

    // Get user's owned books (books they created)
    const ownedBooks = await prisma.book.findMany({
      where: { userId },
      select: { id: true },
    });
    const ownedBookIds = ownedBooks.map(book => book.id);

    // Combine owned and assigned branch IDs
    const accessibleBookIds = [...new Set([...ownedBookIds, ...assignedBranchIds])];

    // If user has no access, return empty array
    if (accessibleBookIds.length === 0) {
      return res.json({ books: [] });
    }

    // Get all accessible books
    const books = await prisma.book.findMany({
      where: {
        id: { in: accessibleBookIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ 
      books: books.map(book => ({
        id: book.id,
        name: book.name,
        userId: book.userId,
        isOwner: ownedBookIds.includes(book.id),
        owner: {
          id: book.user.id,
          name: book.user.name,
          phone: book.user.phone,
        },
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      }))
    });
  } catch (error: any) {
    console.error('Get books error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Book name is required' });
    }

    const book = await prisma.book.create({
      data: {
        name: name.trim(),
        userId,
      },
    });

    res.status(201).json({ book });
  } catch (error: any) {
    console.error('Create book error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateBook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Book name is required' });
    }

    // Verify book belongs to user
    const existingBook = await prisma.book.findFirst({
      where: { id, userId },
    });

    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = await prisma.book.update({
      where: { id },
      data: { name: name.trim() },
    });

    res.json({ book });
  } catch (error: any) {
    console.error('Update book error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Verify book belongs to user
    const existingBook = await prisma.book.findFirst({
      where: { id, userId },
    });

    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await prisma.book.delete({
      where: { id },
    });

    res.json({ message: 'Book deleted successfully' });
  } catch (error: any) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

