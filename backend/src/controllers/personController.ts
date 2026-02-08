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

    // Check if user is staff
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Get accessible branch IDs
    let accessibleBranchIds: string[] = [];

    if (staff) {
      // Staff: Get assigned branches
      const branchAccess = await prisma.userBranchAccess.findMany({
        where: { userId },
        select: { bookId: true },
      });
      accessibleBranchIds = branchAccess.map(access => access.bookId);
    } else {
      // Owner: Get owned books
      const ownedBooks = await prisma.book.findMany({
        where: { userId },
        select: { id: true },
      });
      accessibleBranchIds = ownedBooks.map(book => book.id);
    }

    // If user has no branch access, return empty array
    if (accessibleBranchIds.length === 0) {
      return res.json({ people: [] });
    }

    // Build where clause
    const where: any = {
      bookId: { in: accessibleBranchIds },
    };

    // Filter by status if provided, otherwise show all (ACTIVE and INACTIVE)
    if (status) {
      where.status = status;
    }
    // If no status filter, show all customers (both ACTIVE and INACTIVE)

    // If specific bookId is requested, verify it's in accessible branches
    if (bookId) {
      const requestedBookId = bookId as string;
      if (accessibleBranchIds.includes(requestedBookId)) {
        where.bookId = requestedBookId;
      } else {
        // Staff doesn't have access to this branch
        return res.status(403).json({ error: 'Access denied to this branch' });
      }
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

    // Map people with their actual status from database
    const peopleWithStatus = people.map((person) => {
      return {
        id: person.id,
        name: person.name,
        phone: person.phone,
        address: person.address,
        accountNo: person.accountNo,
        kycDocuments: person.kycDocuments ? JSON.parse(person.kycDocuments) : null,
        loansCount: person._count.loans,
        status: person.status || 'ACTIVE', // Use actual status from database
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Person ID is required' });
    }

    // Check if user is staff
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Verify person access - owners can access their own books, staff can access assigned branches
    let person = null;
    if (staff) {
      // Staff: Check if they have access to the person's branch
      const personData = await prisma.person.findUnique({
        where: { id },
        include: { book: true },
      });
      
      if (personData) {
        const branchAccess = await prisma.userBranchAccess.findFirst({
          where: {
            userId,
            bookId: personData.bookId,
          },
        });
        if (branchAccess) {
          person = await prisma.person.findUnique({
            where: { id },
            include: {
              book: {
                select: {
                  id: true,
                  name: true,
                },
              },
              loans: {
                include: {
                  transactions: {
                    where: { type: 'PAYMENT' },
                  },
                },
              },
            },
          });
        }
      }
    } else {
      // Owner: Check if they own the book
      person = await prisma.person.findFirst({
        where: {
          id,
          book: { userId },
        },
        include: {
          book: {
            select: {
              id: true,
              name: true,
            },
          },
          loans: {
            include: {
              transactions: {
                where: { type: 'PAYMENT' },
              },
            },
          },
        },
      });
    }

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Calculate totals
    let totalLent = 0;

    person.loans.forEach((loan: any) => {
      if (loan.accountType === 'LENT') {
        totalLent += loan.principalAmount;
      }
    });

    // Parse kycDocuments if it exists
    let parsedKycDocuments = null;
    if (person.kycDocuments) {
      try {
        parsedKycDocuments = typeof person.kycDocuments === 'string' 
          ? JSON.parse(person.kycDocuments) 
          : person.kycDocuments;
      } catch (e) {
        console.error('Error parsing kycDocuments:', e);
        parsedKycDocuments = null;
      }
    }

    res.json({
      person: {
        ...person,
        kycDocuments: parsedKycDocuments,
        totals: {
          totalLent,
          totalLoans: person.loans.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Get person error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Generate a unique 10-digit account number with series logic
async function generateAccountNumber(bookId: string): Promise<string> {
  // Get the count of people in this book to create sequential numbering
  const personCount = await prisma.person.count({
    where: { bookId },
  });

  // Generate book prefix from bookId (first 3 characters converted to numbers, take first 2)
  // This creates a series identifier for each book/branch
  const bookHash = bookId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bookPrefix = (bookHash % 100).toString().padStart(2, '0');

  // Sequential number within the book (6 digits, starting from 1)
  // This ensures each customer in a branch gets a unique sequential number
  const sequentialNumber = (personCount + 1).toString().padStart(6, '0');

  // Generate random 2 digits for additional uniqueness
  const randomDigits = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');

  // Combine: 2 (book prefix) + 6 (sequential) + 2 (random) = 10 digits
  let accountNo = bookPrefix + sequentialNumber + randomDigits;

  // Ensure uniqueness - check if account number already exists in this book
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.person.findFirst({
      where: { accountNo, bookId },
    });

    if (!existing) {
      break; // Account number is unique
    }

    // Regenerate random digits if collision occurs
    const newRandomDigits = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    accountNo = bookPrefix + sequentialNumber + newRandomDigits;
    attempts++;
  }

  // Final fallback: if still not unique after 10 attempts, use timestamp-based suffix
  if (attempts >= 10) {
    const timestampSuffix = Date.now().toString().slice(-2);
    accountNo = bookPrefix + sequentialNumber + timestampSuffix;
  }

  return accountNo;
}

export const createPerson = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone, address, accountNo, bookId, kycDocuments } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
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

    // Generate account number automatically if not provided
    let finalAccountNo = accountNo?.trim() || null;
    if (!finalAccountNo) {
      finalAccountNo = await generateAccountNumber(bookId);
    }

    // Handle KYC documents - can be JSON string or object
    let kycDocs = null;
    if (kycDocuments) {
      if (typeof kycDocuments === 'string') {
        kycDocs = kycDocuments;
      } else {
        kycDocs = JSON.stringify(kycDocuments);
      }
    }

    const person = await prisma.person.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        accountNo: finalAccountNo,
        bookId,
        kycDocuments: kycDocs,
        status: 'ACTIVE',
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, phone, address, accountNo, kycDocuments } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Person ID is required' });
    }

    // Check if user is staff
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Verify person access - owners can access their own books, staff can access assigned branches
    let existingPerson = null;
    if (staff) {
      // Staff: Check if they have access to the person's branch
      const person = await prisma.person.findUnique({
        where: { id },
        include: { book: true },
      });
      
      if (person) {
        const branchAccess = await prisma.userBranchAccess.findFirst({
          where: {
            userId,
            bookId: person.bookId,
          },
        });
        if (branchAccess) {
          existingPerson = person;
        }
      }
    } else {
      // Owner: Check if they own the book
      existingPerson = await prisma.person.findFirst({
        where: {
          id,
          book: { userId },
        },
      });
    }

    if (!existingPerson) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Handle KYC documents - can be JSON string or object
    let kycDocs = existingPerson.kycDocuments;
    if (kycDocuments !== undefined) {
      if (kycDocuments === null) {
        kycDocs = null;
      } else if (typeof kycDocuments === 'string') {
        kycDocs = kycDocuments;
      } else {
        kycDocs = JSON.stringify(kycDocuments);
      }
    }

    const person = await prisma.person.update({
      where: { id },
      data: {
        name: name?.trim(),
        phone: phone?.trim(),
        address: address?.trim() || null,
        accountNo: accountNo?.trim() || null,
        kycDocuments: kycDocs,
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Person ID is required' });
    }

    // Check if user is staff
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Verify person access - owners can access their own books, staff can access assigned branches
    let existingPerson = null;
    if (staff) {
      // Staff: Check if they have access to the person's branch
      const person = await prisma.person.findUnique({
        where: { id },
        include: { book: true },
      });
      
      if (person) {
        const branchAccess = await prisma.userBranchAccess.findFirst({
          where: {
            userId,
            bookId: person.bookId,
          },
        });
        if (branchAccess) {
          existingPerson = person;
        }
      }
    } else {
      // Owner: Check if they own the book
      existingPerson = await prisma.person.findFirst({
        where: {
          id,
          book: { userId },
        },
      });
    }

    if (!existingPerson) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Set status to INACTIVE instead of deleting
    const person = await prisma.person.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    });

    res.json({ message: 'Person deactivated successfully', person });
  } catch (error: any) {
    console.error('Delete person error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

