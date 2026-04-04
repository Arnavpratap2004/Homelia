import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../../../lib/auth';
import { handleApiError, ApiError } from '../../../lib/errors';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().optional(),
  gstNumber: z.string().optional(),
  role: z.enum(['B2B_CUSTOMER', 'RETAIL_CUSTOMER', 'DEALER']).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    }
    const input = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: input.email.toLowerCase() }, { phone: input.phone }] },
    });
    if (existing) {
      if (existing.email === input.email.toLowerCase()) throw ApiError.conflict('Email already registered');
      throw ApiError.conflict('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash,
        name: input.name,
        companyName: input.companyName,
        gstNumber: input.gstNumber,
        role: (input.role as any) || 'RETAIL_CUSTOMER',
      },
      select: { id: true, email: true, phone: true, name: true, role: true, companyName: true, gstNumber: true, isVerified: true },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    // Notify admin
    await prisma.notification.create({
      data: {
        type: 'USER_REGISTERED',
        title: 'New User Registration',
        message: `New ${user.role.toLowerCase().replace('_', ' ')} registered: ${user.name} (${user.email})`,
        data: { userId: user.id, name: user.name, email: user.email, role: user.role },
        recipientRole: 'ADMIN',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, tokens: { accessToken, refreshToken } },
    });
  } catch (err) {
    console.error('Stack:', (err as Error).stack);
    handleApiError(err, res);
  }
}
