import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';
import { getPaginationParams, createPaginatedResult } from '../../../lib/helpers';
import { Prisma } from '@prisma/client';

const listQuerySchema = z.object({
  page: z.coerce.number().optional(), limit: z.coerce.number().optional(),
  financialYear: z.string().optional(),
  invoiceType: z.enum(['PROFORMA', 'TAX_INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE']).optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const { page = 1, limit = 20, financialYear, invoiceType } = parsed.data;
    const { skip, take } = getPaginationParams({ page, limit });
    const where: Prisma.InvoiceWhereInput = {};
    if (financialYear) where.financialYear = financialYear;
    if (invoiceType) where.invoiceType = invoiceType;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take, orderBy: { issuedAt: 'desc' },
        include: { order: { select: { orderNumber: true, user: { select: { name: true, companyName: true } } } } },
      }),
      prisma.invoice.count({ where }),
    ]);
    res.json({ success: true, ...createPaginatedResult(invoices, total, page, limit) });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
