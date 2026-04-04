import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError } from '../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const orderId = req.query.orderId as string;
    const invoices = await prisma.invoice.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: invoices });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
