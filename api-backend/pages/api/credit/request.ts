import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    if (req.user?.role !== 'DEALER') return res.status(403).json({ success: false, message: 'Access denied. Dealers only.' });
    const { amount, notes } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const currentLimit = user.creditLimit;
    const requestedIncrease = Number(amount) - Number(currentLimit);
    if (requestedIncrease <= 0) return res.status(400).json({ success: false, message: 'Requested amount must be higher than current limit' });

    const request = await prisma.creditRequest.create({
      data: { userId: req.user!.userId, amount: Number(amount), currentLimit: Number(currentLimit), requestedIncrease, notes, status: 'PENDING' },
    });
    res.json({ success: true, data: request });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
