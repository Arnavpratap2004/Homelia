import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError } from '../../../../lib/errors';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'INVOICED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  adminNotes: z.string().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const id = req.query.id as string;
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const order = await prisma.order.update({
      where: { id }, data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
      include: { user: true },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        type: 'ORDER_STATUS_UPDATE', title: 'Order Update',
        message: `Order ${order.orderNumber} status: ${parsed.data.status}`,
        data: { orderNumber: order.orderNumber, status: parsed.data.status },
        recipientId: order.userId,
      },
    });

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAdmin(handler);
