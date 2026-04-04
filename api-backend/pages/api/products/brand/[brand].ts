import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { handleApiError } from '../../../../lib/errors';
import { Brand } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const brand = (req.query.brand as string).toUpperCase() as Brand;
    const limit = Number(req.query.limit) || 20;
    const products = await prisma.product.findMany({
      where: { brand, isActive: true },
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { isBestseller: 'desc' }, { name: 'asc' }],
      select: {
        id: true, name: true, productCode: true, brand: true, category: true,
        finish: true, price: true, isPriceOnRequest: true, moq: true, images: true, colors: true,
      },
    });
    res.json({ success: true, data: products });
  } catch (err) {
    handleApiError(err, res);
  }
}
