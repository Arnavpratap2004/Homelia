import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';
import { getPaginationParams, createPaginatedResult } from '../../../lib/helpers';
import { Prisma } from '@prisma/client';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { skip, take } = getPaginationParams({ page, limit });
    const where: Prisma.InvoiceWhereInput = { order: { userId: req.user!.userId } };
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({ where, skip, take, orderBy: { issuedAt: 'desc' }, include: { order: { select: { orderNumber: true } } } }),
      prisma.invoice.count({ where }),
    ]);
    res.json({ success: true, ...createPaginatedResult(invoices, total, page, limit) });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
