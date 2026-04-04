import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, phone: true, name: true, role: true,
        companyName: true, gstNumber: true, isVerified: true,
        creditLimit: true, billingAddress: true, shippingAddress: true,
      },
    });
    if (!user) throw ApiError.notFound('User not found');
    res.json({ success: true, data: user });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
