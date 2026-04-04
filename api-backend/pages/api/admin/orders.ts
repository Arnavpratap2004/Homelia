import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';
import { getPaginationParams, createPaginatedResult } from '../../../lib/helpers';

const listQuerySchema = z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'INVOICED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(), paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED']).optional() });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const { page = 1, limit = 20, ...filters } = parsed.data;
    const { skip, take } = getPaginationParams({ page, limit });
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true, shippingAddress: true, user: { select: { name: true, email: true, companyName: true } }, items: { select: { quantity: true, unitPrice: true, product: { select: { name: true } } } } } }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, ...createPaginatedResult(orders, total, page, limit) });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
