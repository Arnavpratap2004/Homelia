import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  companyName: z.string().optional(),
  gstNumber: z.string().optional(),
  billingAddress: z.record(z.string(), z.unknown()).optional(),
  shippingAddress: z.record(z.string(), z.unknown()).optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const data = parsed.data;

    if (data.phone) {
      const existing = await prisma.user.findFirst({ where: { phone: data.phone, id: { not: req.user!.userId } } });
      if (existing) throw ApiError.conflict('Phone number already in use');
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...data, billingAddress: data.billingAddress as object, shippingAddress: data.shippingAddress as object },
      select: { id: true, email: true, phone: true, name: true, role: true, companyName: true, gstNumber: true, isVerified: true },
    });

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
