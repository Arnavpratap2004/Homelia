import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';
import { getPaginationParams, createPaginatedResult } from '../../../lib/helpers';

const listQuerySchema = z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), status: z.enum(['REQUESTED', 'UNDER_REVIEW', 'NEGOTIATING', 'QUOTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED']).optional() });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const { page = 1, limit = 20, ...filters } = parsed.data;
    const { skip, take } = getPaginationParams({ page, limit });
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true, companyName: true } }, items: { include: { product: { select: { name: true, productCode: true } } } }, _count: { select: { items: true } } } }),
      prisma.quote.count({ where }),
    ]);
    res.json({ success: true, ...createPaginatedResult(quotes, total, page, limit) });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
