import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError, ApiError } from '../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const id = req.query.id as string;
    const isAdmin = req.user!.role === 'ADMIN';
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw ApiError.notFound('Order not found');
    if (!isAdmin && order.userId !== req.user!.userId) throw ApiError.forbidden('Access denied');
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) throw ApiError.badRequest('Cannot cancel order in current status');

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
      }
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });
    });

    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
