import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';
import { amountInWords } from '../../../lib/gst';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const id = req.query.id as string;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { order: { include: { items: { include: { product: true } }, user: true } } },
    });
    if (!invoice) throw ApiError.notFound('Invoice not found');
    res.json({ success: true, data: { ...invoice, amountInWords: amountInWords(invoice.totalAmount.toNumber()) } });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
