import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../../../lib/middleware';
import { handleApiError } from '../../../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const id = req.query.id as string;
    const { status, adminNotes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const request = await prisma.creditRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Request is already processed' });

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.creditRequest.update({ where: { id }, data: { status, adminNotes } });
      if (status === 'APPROVED') {
        const currentUser = await tx.user.findUnique({ where: { id: request.userId }, select: { creditLimit: true } });
        const currentLimit = currentUser?.creditLimit ? Number(currentUser.creditLimit) : 0;
        await tx.user.update({ where: { id: request.userId }, data: { creditLimit: currentLimit + Number(request.amount) } });
      }
      return updated;
    });
    res.json({ success: true, data: result });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
