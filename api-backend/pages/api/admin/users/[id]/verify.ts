import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../../lib/middleware';
import { handleApiError } from '../../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const id = req.query.id as string;
    const user = await prisma.user.update({ where: { id }, data: { isVerified: true }, select: { id: true, email: true, name: true, isVerified: true } });
    res.json({ success: true, message: 'User verified', data: user });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
