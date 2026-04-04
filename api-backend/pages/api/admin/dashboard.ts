import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [totalOrders, pendingOrders, todayOrders, pendingQuotes, pendingPayments, lowStockProducts, totalRevenue, unreadNotifications] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.quote.count({ where: { status: { in: ['REQUESTED', 'UNDER_REVIEW'] } } }),
      prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.product.count({ where: { stockQuantity: { lt: 10 }, isActive: true } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.notification.count({ where: { isRead: false, recipientRole: 'ADMIN' } }),
    ]);
    res.json({
      success: true, data: {
        orders: { total: totalOrders, pending: pendingOrders, today: todayOrders },
        quotes: { pending: pendingQuotes }, payments: { pending: pendingPayments },
        inventory: { lowStock: lowStockProducts },
        revenue: { total: totalRevenue._sum.totalAmount?.toNumber() || 0 },
        notifications: { unread: unreadNotifications },
      },
    });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
