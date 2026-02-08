import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { InterestCalculator } from '../services/interestCalculator';

export const getAllLoans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { bookId, status, strategy, search, accountType } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's accessible branch IDs (owned books + assigned branches)
    const branchAccess = await prisma.userBranchAccess.findMany({
      where: { userId },
      select: { bookId: true },
    });
    const assignedBranchIds = branchAccess.map(access => access.bookId);

    const ownedBooks = await prisma.book.findMany({
      where: { userId },
      select: { id: true },
    });
    const ownedBookIds = ownedBooks.map(book => book.id);

    const accessibleBookIds = [...new Set([...ownedBookIds, ...assignedBranchIds])];

    // If user has no access, return empty array
    if (accessibleBookIds.length === 0) {
      return res.json({ loans: [] });
    }

    const where: any = {
      bookId: { in: accessibleBookIds },
    };

    // If specific bookId is requested, verify it's in accessible branches
    if (bookId) {
      const requestedBookId = bookId as string;
      if (accessibleBookIds.includes(requestedBookId)) {
        where.bookId = requestedBookId;
      } else {
        return res.status(403).json({ error: 'Access denied to this branch' });
      }
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'DELETED' };
    }

    if (strategy) {
      where.strategy = strategy;
    }

    if (accountType) {
      where.accountType = accountType;
    }

    if (search) {
      where.OR = [
        { billNumber: { contains: search as string, mode: 'insensitive' } },
        {
          person: {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { phone: { contains: search as string, mode: 'insensitive' } },
            ],
          },
        },
      ];
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
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals for each loan
    const loansWithTotals = loans.map((loan) => {
      const recovered = loan.transactions.reduce((sum, t) => sum + t.amount, 0);
      const interest = InterestCalculator.calculateInterest(
        loan.principalAmount,
        loan.interestRate,
        loan.startDate,
        loan.endDate,
        loan.loanType as 'WITH_INTEREST' | 'FIXED_AMOUNT',
        loan.interestCalc as 'MONTHLY' | 'HALF_MONTHLY' | 'WEEKLY' | 'DAILY',
        loan.interestEvery as 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY',
        loan.hasCompounding
      );
      const total = loan.principalAmount + interest;
      const outstanding = total - recovered;

      return {
        id: loan.id,
        billNumber: loan.billNumber,
        person: loan.person,
        principalAmount: loan.principalAmount,
        interest,
        total,
        outstanding,
        startDate: loan.startDate,
        endDate: loan.endDate,
        status: loan.status,
        strategy: loan.strategy,
        accountType: loan.accountType,
      };
    });

    res.json({ loans: loansWithTotals });
  } catch (error: any) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getLoanById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    const loan = await prisma.loan.findFirst({
      where: {
        id,
        book: { userId },
      },
      include: {
        person: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        collaterals: true,
      },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Calculate totals
    const recovered = (loan.transactions || [])
      .filter((t: any) => t.type === 'PAYMENT')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const topup = (loan.transactions || [])
      .filter((t: any) => t.type === 'TOPUP')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const interest = InterestCalculator.calculateInterest(
      loan.principalAmount,
      loan.interestRate,
      loan.startDate,
      loan.endDate,
      loan.loanType as 'WITH_INTEREST' | 'FIXED_AMOUNT',
      loan.interestCalc as 'MONTHLY' | 'HALF_MONTHLY' | 'WEEKLY' | 'DAILY',
      loan.interestEvery as 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY',
      loan.hasCompounding
    );

    const processFee = loan.processFee || 0;
    const total = loan.principalAmount + topup + interest + processFee;
    const amountLeft = total - recovered;

    // Calculate time duration
    const endDate = loan.endDate || new Date();
    const days = Math.ceil(
      (endDate.getTime() - loan.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    // Generate EMI breakdown if loan has EMI
    let emiBreakdown: any[] = [];
    if (loan.hasEMI && loan.numberOfEMI) {
      const emiTotal = loan.principalAmount + interest + processFee;
      const emiAmount = loan.numberOfEMI > 0 ? emiTotal / loan.numberOfEMI : 0;
      const principalPerPeriod = loan.principalAmount / loan.numberOfEMI;
      const interestPerPeriod = interest / loan.numberOfEMI;
      const processFeePerPeriod = processFee / loan.numberOfEMI;
      
      let balance = emiTotal;

      for (let i = 1; i <= loan.numberOfEMI; i++) {
        const periodDate = new Date(loan.startDate);
        
        // Calculate date based on interest calculation frequency
        switch (loan.interestCalc) {
          case 'MONTHLY':
            periodDate.setMonth(periodDate.getMonth() + i);
            break;
          case 'HALF_MONTHLY':
            periodDate.setDate(periodDate.getDate() + (i * 15));
            break;
          case 'WEEKLY':
            periodDate.setDate(periodDate.getDate() + (i * 7));
            break;
          case 'DAILY':
            periodDate.setDate(periodDate.getDate() + i);
            break;
        }

        balance -= emiAmount;
        const isLastRow = i === loan.numberOfEMI;

        emiBreakdown.push({
          period: i,
          date: periodDate.toISOString(),
          principal: principalPerPeriod,
          interest: interestPerPeriod,
          processFee: processFeePerPeriod,
          emiAmount: emiAmount,
          balance: isLastRow ? 0 : Math.max(0, balance),
        });
      }
    }

    res.json({
      loan: {
        ...loan,
        calculated: {
          interest,
          processFee,
          total,
          topup,
          amountRecovered: recovered,
          amountLeft,
          timeDuration: {
            years,
            months,
            days: remainingDays,
          },
          emiBreakdown,
        },
      },
    });
  } catch (error: any) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createLoan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      personId,
      bookId,
      accountType,
      loanType,
      interestCalc,
      principalAmount,
      interestRate,
      interestEvery,
      startDate,
      endDate,
      hasEMI,
      numberOfEMI,
      hasCompounding,
      dateToDateCalc,
      strategy,
      remarks,
      billNumber,
      processFee,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!personId || !bookId || !principalAmount || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user is staff
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Verify book access - owners can access their own books, staff can access assigned branches
    let book = null;
    if (staff) {
      // Staff: Check if they have access to this branch
      const branchAccess = await prisma.userBranchAccess.findFirst({
        where: {
          userId,
          bookId,
        },
        include: {
          book: true,
        },
      });
      if (branchAccess) {
        book = branchAccess.book;
      }
    } else {
      // Owner: Check if they own the book
      book = await prisma.book.findFirst({
        where: { id: bookId, userId },
      });
    }

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Verify person belongs to book
    const person = await prisma.person.findFirst({
      where: { id: personId, bookId },
    });

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Generate bill number if not provided
    let finalBillNumber = billNumber;
    if (!finalBillNumber) {
      const count = await prisma.loan.count({
        where: { bookId },
      });
      finalBillNumber = `${310000 + count + 1}`;
    }

    const loan = await prisma.loan.create({
      data: {
        billNumber: finalBillNumber,
        personId,
        bookId,
        accountType: 'LENT',
        loanType: loanType || 'WITH_INTEREST',
        interestCalc: interestCalc || 'MONTHLY',
        principalAmount: parseFloat(principalAmount),
        interestRate: parseFloat(interestRate) || 0,
        interestEvery: interestEvery || 'MONTHLY',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        hasEMI: hasEMI || false,
        numberOfEMI: numberOfEMI || null,
        hasCompounding: hasCompounding || false,
        dateToDateCalc: dateToDateCalc || false,
        processFee: processFee ? parseFloat(processFee) : 0,
        strategy: strategy || 'SIMPLE_INTEREST',
        remarks: remarks || null,
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ loan });
  } catch (error: any) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateLoan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify loan belongs to user
    const existingLoan = await prisma.loan.findFirst({
      where: {
        id,
        book: { userId },
      },
    });

    if (!existingLoan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Prepare update data
    const data: any = {};
    if (updateData.remarks !== undefined) data.remarks = updateData.remarks;
    if (updateData.billNumber !== undefined) data.billNumber = updateData.billNumber;
    if (updateData.endDate !== undefined) data.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    if (updateData.status !== undefined) data.status = updateData.status;

    const loan = await prisma.loan.update({
      where: { id },
      data,
    });

    res.json({ loan });
  } catch (error: any) {
    console.error('Update loan error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteLoan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    // Verify loan belongs to user
    const existingLoan = await prisma.loan.findFirst({
      where: {
        id,
        book: { userId },
      },
    });

    if (!existingLoan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Soft delete - set status to DELETED
    await prisma.loan.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    res.json({ message: 'Loan deleted successfully' });
  } catch (error: any) {
    console.error('Delete loan error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { amount, paymentMode, date, remarks } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    if (!amount || !paymentMode) {
      return res.status(400).json({ error: 'Amount and payment mode are required' });
    }

    // Verify loan belongs to user
    const loan = await prisma.loan.findFirst({
      where: {
        id,
        book: { userId },
      },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        loanId: id,
        amount: parseFloat(amount),
        type: 'PAYMENT',
        paymentMode,
        date: date ? new Date(date) : new Date(),
        remarks: remarks || null,
      },
    });

    res.status(201).json({ transaction });
  } catch (error: any) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

