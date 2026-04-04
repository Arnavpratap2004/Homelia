import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError } from '../../../../lib/errors';

const salesReportSchema = z.object({ startDate: z.coerce.date(), endDate: z.coerce.date(), groupBy: z.enum(['day', 'month', 'brand']).optional() });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const parsed = salesReportSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const { startDate, endDate } = parsed.data;
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
      include: { items: { include: { product: { select: { brand: true } } } } },
    });
    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.totalAmount.toNumber(), 0),
      totalTax: orders.reduce((s, o) => s + o.totalTax.toNumber(), 0),
      byBrand: {} as Record<string, { orders: number; revenue: number }>,
    };
    for (const order of orders) {
      for (const item of order.items) {
        const brand = item.product.brand;
        if (!summary.byBrand[brand]) summary.byBrand[brand] = { orders: 0, revenue: 0 };
        summary.byBrand[brand].orders++;
        summary.byBrand[brand].revenue += item.totalPrice.toNumber();
      }
    }
    res.json({ success: true, data: { period: { startDate, endDate }, summary } });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
