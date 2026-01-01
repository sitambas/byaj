import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN: StringValue = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;

export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN
  };
  return jwt.sign({ userId }, JWT_SECRET, options);
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

