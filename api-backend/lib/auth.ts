import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  role: Role;
}

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export function generateAccessToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as unknown as number,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as unknown as number,
  });
}

export function verifyAccessToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
      type: string;
    };
    if (decoded.type !== 'refresh') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
