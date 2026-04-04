import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    if (req.user?.role !== 'DEALER') return res.status(403).json({ success: false, message: 'Access denied. Dealers only.' });
    const requests = await prisma.creditRequest.findMany({ where: { userId: req.user!.userId }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: requests });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
