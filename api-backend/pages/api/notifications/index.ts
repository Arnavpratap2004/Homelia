import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const limit = Number(req.query.limit) || 20;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { role: true } });
    const notifications = await prisma.notification.findMany({
      where: { OR: [{ recipientId: req.user!.userId }, { recipientRole: user?.role }] },
      orderBy: { createdAt: 'desc' }, take: limit,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
