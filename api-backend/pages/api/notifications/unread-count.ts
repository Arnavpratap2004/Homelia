import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { role: true } });
    const count = await prisma.notification.count({
      where: { isRead: false, OR: [{ recipientId: req.user!.userId }, { recipientRole: user?.role }] },
    });
    res.json({ success: true, data: { count } });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
