import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { role: true } });
    await prisma.notification.updateMany({
      where: { isRead: false, OR: [{ recipientId: req.user!.userId }, { recipientRole: user?.role }] },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
