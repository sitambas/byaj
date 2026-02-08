import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { InterestCalculator } from '../services/interestCalculator';

export const getInterestReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { borrowerId, bookId } = req.query;

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

    if (borrowerId) {
      where.personId = borrowerId as string;
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
      orderBy: { startDate: 'desc' },
    });

    // Calculate interest for each loan
    const interestReport = loans.map((loan) => {
      const recovered = loan.transactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate interest using the InterestCalculator
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
      const total = loan.principalAmount + interest + processFee;
      const outstanding = total - recovered;

      // Calculate days
      const endDate = loan.endDate || new Date();
      const days = Math.ceil(
        (endDate.getTime() - loan.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: loan.id,
        billNumber: loan.billNumber,
        person: loan.person,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate,
        interest,
        processFee,
        total,
        recovered,
        outstanding,
        startDate: loan.startDate,
        endDate: loan.endDate,
        days,
        loanType: loan.loanType,
        interestCalc: loan.interestCalc,
        status: loan.status,
      };
    });

    // Calculate totals
    const totals = {
      totalPrincipal: interestReport.reduce((sum, loan) => sum + loan.principalAmount, 0),
      totalInterest: interestReport.reduce((sum, loan) => sum + loan.interest, 0),
      totalProcessFee: interestReport.reduce((sum, loan) => sum + loan.processFee, 0),
      totalAmount: interestReport.reduce((sum, loan) => sum + loan.total, 0),
      totalRecovered: interestReport.reduce((sum, loan) => sum + loan.recovered, 0),
      totalOutstanding: interestReport.reduce((sum, loan) => sum + loan.outstanding, 0),
    };

    res.json({
      loans: interestReport,
      totals,
      borrower: borrowerId && interestReport.length > 0 ? interestReport[0].person : null,
    });
  } catch (error: any) {
    console.error('Get interest report error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getTransactionReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { bookId, personId, loanId, type, paymentMode, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: any = {
      loan: {
        book: { userId },
        status: { not: 'DELETED' },
      },
    };

    if (bookId) {
      where.loan.bookId = bookId as string;
    }

    if (personId) {
      where.loan.personId = personId as string;
    }

    if (loanId) {
      where.loanId = loanId as string;
    }

    if (type) {
      where.type = type as string;
    }

    if (paymentMode) {
      where.paymentMode = paymentMode as string;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        loan: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const totals = {
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      totalByType: transactions.reduce((acc: any, t) => {
        acc[t.type] = (acc[t.type] || 0) + t.amount;
        return acc;
      }, {}),
      totalByPaymentMode: transactions.reduce((acc: any, t) => {
        acc[t.paymentMode] = (acc[t.paymentMode] || 0) + t.amount;
        return acc;
      }, {}),
      count: transactions.length,
    };

    res.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        loanId: t.loanId,
        billNumber: t.loan.billNumber,
        person: t.loan.person,
        amount: t.amount,
        type: t.type,
        paymentMode: t.paymentMode,
        date: t.date,
        remarks: t.remarks,
        createdAt: t.createdAt,
      })),
      totals,
    });
  } catch (error: any) {
    console.error('Get transaction report error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Helper function to generate EMI breakdown
function generateEMIBreakdown(
  principal: number,
  interest: number,
  processFee: number,
  tenure: number,
  startDate: Date,
  interestCalc: string
) {
  const total = principal + interest + processFee;
  const emiAmount = tenure > 0 ? total / tenure : 0;
  const principalPerPeriod = principal / tenure;
  const interestPerPeriod = interest / tenure;
  const processFeePerPeriod = processFee / tenure;
  
  const breakdown = [];
  let balance = total;

  for (let i = 1; i <= tenure; i++) {
    const periodDate = new Date(startDate);
    
    // Calculate date based on interest calculation frequency
    switch (interestCalc) {
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
    const isLastRow = i === tenure;

    breakdown.push({
      period: i,
      date: periodDate.toISOString(),
      principal: principalPerPeriod,
      interest: interestPerPeriod,
      processFee: processFeePerPeriod,
      emiAmount: emiAmount,
      balance: isLastRow ? 0 : Math.max(0, balance),
    });
  }

  return breakdown;
}

export const getPartyStatement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { personId, bookId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!personId) {
      return res.status(400).json({ error: 'Person ID is required' });
    }

    // Get person details
    const person = await prisma.person.findFirst({
      where: {
        id: personId as string,
        book: {
          userId,
          ...(bookId ? { id: bookId as string } : {}),
        },
      },
      include: {
        book: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Get all loans for this person
    const where: any = {
      personId: personId as string,
      book: { userId },
      status: { not: 'DELETED' },
    };

    if (bookId) {
      where.bookId = bookId as string;
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    // Process each loan with EMI breakdown
    const loansWithBreakdown = loans.map((loan) => {
      const recovered = loan.transactions
        .filter((t) => t.type === 'PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate interest
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
      const total = loan.principalAmount + interest + processFee;
      const outstanding = total - recovered;

      // Generate EMI breakdown if loan has EMI
      let emiBreakdown: any[] = [];
      if (loan.hasEMI && loan.numberOfEMI) {
        emiBreakdown = generateEMIBreakdown(
          loan.principalAmount,
          interest,
          processFee,
          loan.numberOfEMI,
          loan.startDate,
          loan.interestCalc || 'MONTHLY'
        );
      }

      return {
        id: loan.id,
        billNumber: loan.billNumber,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate,
        interest,
        processFee,
        total,
        recovered,
        outstanding,
        startDate: loan.startDate,
        endDate: loan.endDate,
        loanType: loan.loanType,
        interestCalc: loan.interestCalc,
        hasEMI: loan.hasEMI,
        numberOfEMI: loan.numberOfEMI,
        status: loan.status,
        emiBreakdown,
        transactions: loan.transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          paymentMode: t.paymentMode,
          date: t.date,
          remarks: t.remarks,
        })),
      };
    });

    // Calculate totals
    const totals = {
      totalPrincipal: loansWithBreakdown.reduce((sum, loan) => sum + loan.principalAmount, 0),
      totalInterest: loansWithBreakdown.reduce((sum, loan) => sum + loan.interest, 0),
      totalProcessFee: loansWithBreakdown.reduce((sum, loan) => sum + loan.processFee, 0),
      totalAmount: loansWithBreakdown.reduce((sum, loan) => sum + loan.total, 0),
      totalRecovered: loansWithBreakdown.reduce((sum, loan) => sum + loan.recovered, 0),
      totalOutstanding: loansWithBreakdown.reduce((sum, loan) => sum + loan.outstanding, 0),
    };

    res.json({
      person: {
        id: person.id,
        name: person.name,
        phone: person.phone,
        address: person.address,
        accountNumber: person.accountNo,
      },
      book: person.book,
      loans: loansWithBreakdown,
      totals,
    });
  } catch (error: any) {
    console.error('Get party statement error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getAccountSummary = async (req: AuthRequest, res: Response) => {
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

    // Get all loans
    const loans = await prisma.loan.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            name: true,
            phone: true,
            accountNo: true,
          },
        },
        transactions: {
          where: { type: 'PAYMENT' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all people
    const peopleWhere: any = {
      book: { userId },
    };

    if (bookId) {
      peopleWhere.bookId = bookId as string;
    }

    const people = await prisma.person.findMany({
      where: peopleWhere,
      include: {
        _count: {
          select: {
            loans: {
              where: { status: { not: 'DELETED' } },
            },
          },
        },
      },
    });

    // Calculate loan statistics
    const loanStats = loans.map((loan) => {
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
        recovered,
        outstanding,
        accountType: loan.accountType,
        loanType: loan.loanType,
        status: loan.status,
        startDate: loan.startDate,
        endDate: loan.endDate,
      };
    });

    // Calculate totals
    const totals = {
      totalPeople: people.length,
      totalLoans: loans.length,
      activeLoans: loans.filter((l) => l.status === 'ACTIVE').length,
      closedLoans: loans.filter((l) => l.status === 'CLOSED').length,
      
      // LENT loans
      totalLent: loanStats
        .filter((l) => l.accountType === 'LENT')
        .reduce((sum, l) => sum + l.principalAmount, 0),
      totalLentInterest: loanStats
        .filter((l) => l.accountType === 'LENT')
        .reduce((sum, l) => sum + l.interest, 0),
      totalLentProcessFee: loanStats
        .filter((l) => l.accountType === 'LENT')
        .reduce((sum, l) => sum + l.processFee, 0),
      totalLentAmount: loanStats
        .filter((l) => l.accountType === 'LENT')
        .reduce((sum, l) => sum + l.total, 0),
      totalLentRecovered: loanStats
        .filter((l) => l.accountType === 'LENT')
        .reduce((sum, l) => sum + l.recovered, 0),
      totalLentOutstanding: loanStats
        .filter((l) => l.accountType === 'LENT')
        .reduce((sum, l) => sum + l.outstanding, 0),
    };

    res.json({
      summary: totals,
      loans: loanStats,
      people: people.map((p) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        accountNo: p.accountNo,
        loanCount: p._count.loans,
      })),
    });
  } catch (error: any) {
    console.error('Get account summary error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

