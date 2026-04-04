import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError } from '../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const { status } = req.query;
    const whereClause: any = {};
    if (status) whereClause.status = status;
    const requests = await prisma.creditRequest.findMany({
      where: whereClause,
      include: { user: { select: { name: true, companyName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: requests });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
