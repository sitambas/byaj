import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllPeople = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { bookId, search, status } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: any = {
      book: { userId },
    };

    if (bookId) {
      where.bookId = bookId as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const people = await prisma.person.findMany({
      where,
      include: {
        _count: {
          select: { loans: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate status based on loans
    const peopleWithStatus = people.map((person) => {
      // Status will be determined by active loans
      return {
        id: person.id,
        name: person.name,
        phone: person.phone,
        address: person.address,
        accountNo: person.accountNo,
        loansCount: person._count.loans,
        status: 'ACTIVE', // TODO: Calculate based on loans
        createdAt: person.createdAt,
        updatedAt: person.updatedAt,
      };
    });

    res.json({ people: peopleWithStatus });
  } catch (error: any) {
    console.error('Get people error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getPersonById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const person = await prisma.person.findFirst({
      where: {
        id,
        book: { userId },
      },
      include: {
        loans: {
          include: {
            transactions: {
              where: { type: 'PAYMENT' },
            },
          },
        },
      },
    });

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Calculate totals
    let totalLent = 0;
    let totalBorrowed = 0;

    person.loans.forEach((loan) => {
      if (loan.accountType === 'LENT') {
        totalLent += loan.principalAmount;
      } else {
        totalBorrowed += loan.principalAmount;
      }
    });

    res.json({
      person: {
        ...person,
        totals: {
          totalLent,
          totalBorrowed,
          totalLoans: person.loans.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Get person error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createPerson = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone, address, accountNo, bookId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Verify book belongs to user
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const person = await prisma.person.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        accountNo: accountNo?.trim() || null,
        bookId,
      },
    });

    res.status(201).json({ person });
  } catch (error: any) {
    console.error('Create person error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updatePerson = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, phone, address, accountNo } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify person belongs to user's book
    const existingPerson = await prisma.person.findFirst({
      where: {
        id,
        book: { userId },
      },
    });

    if (!existingPerson) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const person = await prisma.person.update({
      where: { id },
      data: {
        name: name?.trim(),
        phone: phone?.trim(),
        address: address?.trim() || null,
        accountNo: accountNo?.trim() || null,
      },
    });

    res.json({ person });
  } catch (error: any) {
    console.error('Update person error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deletePerson = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify person belongs to user's book
    const existingPerson = await prisma.person.findFirst({
      where: {
        id,
        book: { userId },
      },
    });

    if (!existingPerson) {
      return res.status(404).json({ error: 'Person not found' });
    }

    await prisma.person.delete({
      where: { id },
    });

    res.json({ message: 'Person deleted successfully' });
  } catch (error: any) {
    console.error('Delete person error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

