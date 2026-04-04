l̥l̥import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { handleApiError } from '../../../lib/errors';
import { Brand } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const brand = req.query.brand as Brand | undefined;
    const result = await prisma.product.findMany({
      where: { isActive: true, collection: { not: null }, ...(brand && { brand }) },
      distinct: ['collection'],
      select: { collection: true },
    });
    const collections = result.map(r => r.collection).filter(Boolean) as string[];
    res.json({ success: true, data: collections });
  } catch (err) {
    handleApiError(err, res);
  }
}
