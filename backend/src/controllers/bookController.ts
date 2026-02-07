import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllBooks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const books = await prisma.book.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ books });
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

