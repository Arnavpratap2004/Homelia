import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError } from '../../../../lib/errors';

const updateStockSchema = z.object({ quantity: z.number().int().min(0) });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const id = req.query.id as string;
    const parsed = updateStockSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    await prisma.product.update({ where: { id }, data: { stockQuantity: parsed.data.quantity } });
    res.json({ success: true, message: 'Stock updated' });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAdmin(handler);
