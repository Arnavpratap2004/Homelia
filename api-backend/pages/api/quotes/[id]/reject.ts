import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError } from '../../../../lib/errors';

const rejectSchema = z.object({ reason: z.string().min(1) });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const id = req.query.id as string;
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const quote = await prisma.quote.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: parsed.data.reason }, include: { user: true } });
    await prisma.notification.create({ data: { type: 'QUOTE_STATUS_UPDATE', title: 'Quote Update', message: `Your quote has been rejected: ${quote.quoteNumber}`, data: { quoteNumber: quote.quoteNumber, status: 'REJECTED' }, recipientId: quote.userId } });
    res.json({ success: true, message: 'Quote rejected', data: quote });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
