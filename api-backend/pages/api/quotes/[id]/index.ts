import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError, ApiError } from '../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const id = req.query.id as string;
    const isAdmin = req.user!.role === 'ADMIN';
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, companyName: true, gstNumber: true, stateCode: true } },
        items: { include: { product: true } }, order: true,
      },
    });
    if (!quote) throw ApiError.notFound('Quote not found');
    if (!isAdmin && quote.userId !== req.user!.userId) throw ApiError.forbidden('Access denied');
    res.json({ success: true, data: quote });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
