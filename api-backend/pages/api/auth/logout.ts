import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    await prisma.user.update({ where: { id: req.user!.userId }, data: { refreshToken: null } });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
