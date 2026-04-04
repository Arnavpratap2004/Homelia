import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../../../lib/auth';
import { handleApiError, ApiError } from '../../../lib/errors';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['ADMIN', 'DEALER', 'B2B_CUSTOMER', 'RETAIL_CUSTOMER']).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    }
    const input = parsed.data;

    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

    // Strict role check
    if (input.role && user.role !== input.role) {
      throw ApiError.forbidden(`Access Denied: You cannot log in to this portal as ${user.role}`);
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) throw ApiError.unauthorized('Invalid email or password');

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id, email: user.email, phone: user.phone, name: user.name,
          role: user.role, companyName: user.companyName, gstNumber: user.gstNumber, isVerified: user.isVerified,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err) {
    handleApiError(err, res);
  }
}
