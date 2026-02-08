import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { bookId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Build where clause
    const where: any = {
      book: { userId },
      status: { not: 'DELETED' },
      accountType: 'LENT',
    };

    if (bookId) {
      where.bookId = bookId as string;
    }

    // Get all loans
    const loans = await prisma.loan.findMany({
      where,
      include: {
        transactions: {
          where: { type: 'PAYMENT' },
        },
      },
    });

    // Calculate totals
    let totalLent = 0;
    let totalOutstanding = 0;
    let peopleOwe = 0;
    let totalInterest = 0;

    loans.forEach((loan) => {
      const principal = loan.principalAmount;
      const recovered = loan.transactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate interest (simplified - should use proper calculation service)
      const days = loan.endDate
        ? Math.ceil((new Date(loan.endDate).getTime() - new Date(loan.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      let interest = 0;
      if (loan.loanType === 'WITH_INTEREST') {
        if (loan.interestCalc === 'MONTHLY') {
          const months = Math.ceil(days / 30);
          interest = (principal * loan.interestRate * months) / 100;
        } else {
          interest = (principal * loan.interestRate * days) / (100 * 365);
        }
      }
      
      totalInterest += interest;
      const total = principal + interest;
      const outstanding = total - recovered;

      totalLent += principal;
      totalOutstanding += outstanding;
      peopleOwe += outstanding;
    });

    res.json({
      totalOutstanding,
      totalLent,
      peopleOwe,
      totalInterest,
    });
  } catch (error: any) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getCharts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { bookId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: any = {
      book: { userId },
      status: { not: 'DELETED' },
      accountType: 'LENT',
    };

    if (bookId) {
      where.bookId = bookId as string;
    }

    const loans = await prisma.loan.findMany({
      where,
    });

    let totalLent = 0;
    let totalInterest = 0;

    loans.forEach((loan) => {
      totalLent += loan.principalAmount;
      
      // Calculate interest
      const days = loan.endDate
        ? Math.ceil((new Date(loan.endDate).getTime() - new Date(loan.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      if (loan.loanType === 'WITH_INTEREST') {
        if (loan.interestCalc === 'MONTHLY') {
          const months = Math.ceil(days / 30);
          totalInterest += (loan.principalAmount * loan.interestRate * months) / 100;
        } else {
          totalInterest += (loan.principalAmount * loan.interestRate * days) / (100 * 365);
        }
      }
    });

    res.json({
      totalLent,
      interest: totalInterest,
    });
  } catch (error: any) {
    console.error('Get charts error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getDueLoans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { bookId, filter } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: any = {
      book: { userId },
      status: { not: 'DELETED' },
      accountType: 'LENT',
    };

    if (bookId) {
      where.bookId = bookId as string;
    }

    // Filter by due date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'due-today') {
      where.endDate = {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (filter === 'overdue') {
      where.endDate = { lt: today };
      where.status = 'ACTIVE';
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        transactions: {
          where: { type: 'PAYMENT' },
        },
      },
      orderBy: { endDate: 'asc' },
      take: 50,
    });

    // Calculate outstanding for each loan
    const dueLoans = loans.map((loan) => {
      const recovered = loan.transactions.reduce((sum, t) => sum + t.amount, 0);
      const days = loan.endDate
        ? Math.ceil((new Date(loan.endDate).getTime() - new Date(loan.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      let interest = 0;
      if (loan.loanType === 'WITH_INTEREST') {
        if (loan.interestCalc === 'MONTHLY') {
          const months = Math.ceil(days / 30);
          interest = (loan.principalAmount * loan.interestRate * months) / 100;
        } else {
          interest = (loan.principalAmount * loan.interestRate * days) / (100 * 365);
        }
      }
      
      const processFee = loan.processFee || 0;
      const total = loan.principalAmount + interest + processFee;
      const outstanding = total - recovered;

      return {
        id: loan.id,
        billNumber: loan.billNumber,
        person: loan.person,
        principalAmount: loan.principalAmount,
        interest,
        processFee,
        total,
        outstanding,
        startDate: loan.startDate,
        endDate: loan.endDate,
        status: loan.status,
      };
    });

    res.json({ loans: dueLoans });
  } catch (error: any) {
    console.error('Get due loans error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

