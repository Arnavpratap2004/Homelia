import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../../lib/middleware';
import { handleApiError } from '../../../../../lib/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const id = req.query.id as string;
    if (req.method === 'PATCH') {
      const { isActive } = req.body;
      const user = await prisma.user.update({ where: { id }, data: { isActive }, select: { id: true, email: true, name: true, isActive: true } });
      return res.json({ success: true, message: isActive ? 'User activated' : 'User deactivated', data: user });
    }
    if (req.method === 'DELETE') {
      await prisma.user.delete({ where: { id } });
      return res.json({ success: true, message: 'User deleted successfully' });
    }
    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
