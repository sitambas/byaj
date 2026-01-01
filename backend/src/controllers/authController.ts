import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

// Generate OTP code (always 6 digits)
const generateOTP = (phone: string): string => {
  // For testing: phone "9953520620" always gets OTP "121212" (6 digits)
  if (phone === '9953520620') {
    return '121212';
  }
  // Generate random 6-digit OTP (100000 to 999999)
  // return Math.floor(100000 + Math.random() * 900000).toString();
  return '121212';
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          name: null,
        },
      });
    }

    // Generate OTP
    const otpCode = generateOTP(phone);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete old OTPs for this phone
    await prisma.oTP.deleteMany({
      where: {
        phone,
        verified: false,
      },
    });

    // Create new OTP
    const otp = await prisma.oTP.create({
      data: {
        phone,
        code: otpCode,
        expiresAt,
      },
    });

    // In production, send OTP via SMS service
    // For development, we'll return it in the response
    console.log(`OTP for ${phone}: ${otpCode}`);

    res.json({
      message: 'OTP sent successfully',
      phone: phone,
      // In development, return OTP for testing. Remove this in production
      otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Find the most recent unverified OTP for this phone
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      // Check if OTP exists but is expired or already verified
      const anyOtp = await prisma.oTP.findFirst({
        where: {
          phone,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (anyOtp) {
        if (anyOtp.verified) {
          console.log(`OTP already verified for ${phone}`);
          return res.status(400).json({ error: 'This OTP has already been used. Please request a new OTP' });
        }
        if (anyOtp.expiresAt < new Date()) {
          console.log(`OTP expired for ${phone}. Expired at: ${anyOtp.expiresAt}, Current: ${new Date()}`);
          return res.status(400).json({ error: 'OTP has expired. Please request a new OTP' });
        }
      }

      console.log(`No valid OTP found for ${phone}`);
      return res.status(400).json({ error: 'No valid OTP found. Please request a new OTP first' });
    }

    // Verify OTP code
    console.log(`Verifying OTP for ${phone}: Expected: ${otpRecord.code}, Received: ${otp}`);
    if (otpRecord.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again' });
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: null,
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    console.error('Verify error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

