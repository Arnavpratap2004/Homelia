import type { NextApiResponse } from 'next';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { passwordHash: true } });
    if (!user) throw ApiError.notFound('User not found');

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) throw ApiError.badRequest('Current password is incorrect');

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.userId }, data: { passwordHash: newHash } });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
