import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError } from '../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const id = req.query.id as string;
    await prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
