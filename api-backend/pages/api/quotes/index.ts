import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';
import { getPaginationParams, createPaginatedResult, generateQuoteNumber } from '../../../lib/helpers';
import { Prisma } from '@prisma/client';

const createQuoteSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), requestedQty: z.number().int().min(1), notes: z.string().optional() })).min(1),
  notes: z.string().optional(),
});
const listQuerySchema = z.object({
  page: z.coerce.number().optional(), limit: z.coerce.number().optional(),
  status: z.enum(['REQUESTED', 'UNDER_REVIEW', 'NEGOTIATING', 'QUOTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED']).optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      const { page = 1, limit = 20, ...filters } = parsed.data;
      const { skip, take } = getPaginationParams({ page, limit });
      const isAdmin = req.user!.role === 'ADMIN';
      const where: Prisma.QuoteWhereInput = {};
      if (!isAdmin) where.userId = req.user!.userId;
      if (filters.status) where.status = filters.status;

      const [quotes, total] = await Promise.all([
        prisma.quote.findMany({
          where, skip, take, orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true, companyName: true } },
            items: { include: { product: { select: { name: true, productCode: true } } } },
            _count: { select: { items: true } },
          },
        }),
        prisma.quote.count({ where }),
      ]);
      return res.json({ success: true, ...createPaginatedResult(quotes, total, page, limit) });
    }

    if (req.method === 'POST') {
      const parsed = createQuoteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      const input = parsed.data;
      const productIds = input.items.map(i => i.productId);
      const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
      if (products.length !== productIds.length) throw ApiError.badRequest('One or more products not found');

      const quoteNumber = await generateQuoteNumber();
      const quote = await prisma.quote.create({
        data: {
          quoteNumber, userId: req.user!.userId, status: 'REQUESTED', notes: input.notes,
          items: { create: input.items.map(i => ({ productId: i.productId, requestedQty: i.requestedQty, notes: i.notes })) },
        },
        include: { items: { include: { product: { select: { name: true, productCode: true } } } } },
      });

      await prisma.notification.create({
        data: {
          type: 'NEW_QUOTE', title: 'New Quote Request',
          message: `RFQ ${quote.quoteNumber} submitted with ${input.items.length} products`,
          data: { quoteNumber: quote.quoteNumber }, recipientRole: 'ADMIN',
        },
      });

      return res.status(201).json({ success: true, message: 'Quote request submitted', data: quote });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
