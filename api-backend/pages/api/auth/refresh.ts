import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../lib/auth';
import { handleApiError, ApiError } from '../../../lib/errors';

const refreshSchema = z.object({ refreshToken: z.string() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const payload = verifyRefreshToken(parsed.data.refreshToken);
    if (!payload) throw ApiError.unauthorized('Invalid refresh token');

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, refreshToken: true, isActive: true },
    });

    if (!user || !user.isActive || user.refreshToken !== parsed.data.refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    handleApiError(err, res);
  }
}
