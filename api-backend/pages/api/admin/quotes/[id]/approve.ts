import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../../lib/middleware';
import { handleApiError } from '../../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const id = req.query.id as string;
    const result = await prisma.quote.update({ where: { id }, data: { status: 'APPROVED' } });
    await prisma.notification.create({ data: { type: 'QUOTE_STATUS_UPDATE', title: 'Quote Update', message: `Your quote has been approved: ${result.quoteNumber}`, data: { quoteNumber: result.quoteNumber, status: 'APPROVED' }, recipientId: result.userId } });
    res.json({ success: true, message: 'Quote approved', data: result });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
