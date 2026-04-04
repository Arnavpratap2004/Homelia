import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { handleApiError } from '../../../lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const limit = Number(req.query.limit) || 10;
    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: limit,
      select: { id: true, name: true, productCode: true, brand: true, category: true, price: true, images: true, colors: true },
    });
    res.json({ success: true, data: products });
  } catch (err) {
    handleApiError(err, res);
  }
}
