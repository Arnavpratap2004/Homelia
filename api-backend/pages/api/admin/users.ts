import type { NextApiResponse } from 'next';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

const listQuerySchema = z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), role: z.string().optional(), isVerified: z.string().optional(), isActive: z.string().optional() });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      const page = Number(parsed.data.page) || 1;
      const limit = Math.min(Number(parsed.data.limit) || 20, 100);
      const skip = (page - 1) * limit;
      const where: any = {};
      if (parsed.data.role) where.role = parsed.data.role;
      if (parsed.data.isVerified !== undefined) where.isVerified = parsed.data.isVerified === 'true';
      if (parsed.data.isActive !== undefined) where.isActive = parsed.data.isActive === 'true';

      const [users, total] = await Promise.all([
        prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, phone: true, name: true, role: true, companyName: true, gstNumber: true, isVerified: true, isActive: true, createdAt: true, _count: { select: { orders: true, quotes: true } } } }),
        prisma.user.count({ where }),
      ]);
      return res.json({ success: true, data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }

    if (req.method === 'POST') {
      const { email, phone, password, name, role, companyName } = req.body;
      if (!email || !phone || !password || !name || !role) return res.status(400).json({ success: false, message: 'Missing required fields' });
      const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
      if (existingUser) return res.status(409).json({ success: false, message: 'User with this email or phone already exists' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, phone, passwordHash, name, role: role as any, companyName, isVerified: true, isActive: true },
        select: { id: true, email: true, name: true, role: true, companyName: true, isVerified: true, isActive: true, createdAt: true },
      });
      return res.status(201).json({ success: true, message: 'User created successfully', data: user });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
