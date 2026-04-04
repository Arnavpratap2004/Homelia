import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError, ApiError } from '../../../../lib/errors';
import { Prisma } from '@prisma/client';

const createProductSchema = z.object({
  name: z.string().min(2),
  productCode: z.string().min(3),
  brand: z.enum(['DURIAN', 'ROCKSTAR']),
  category: z.enum(['DECORATIVE', 'COMPACT', 'EXTERIOR', 'FIRE_RETARDANT', 'ANTI_BACTERIAL']),
  collection: z.string().optional(),
  finish: z.enum(['MATTE', 'GLOSSY', 'SUEDE', 'TEXTURED', 'HIGH_GLOSS', 'SILK', 'METALLIC']),
  texture: z.string(),
  thickness: z.string(),
  sheetSize: z.string(),
  applications: z.array(z.string()),
  price: z.number().optional(),
  dealerPrice: z.number().optional(),
  b2bPrice: z.number().optional(),
  isPriceOnRequest: z.boolean().optional(),
  hsnCode: z.string().optional(),
  gstRate: z.number().optional(),
  moq: z.number().int().optional(),
  stockQuantity: z.number().int().optional(),
  images: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  description: z.string().optional(),
  technicalSpecs: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
}).partial();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;

  try {
    if (req.method === 'GET') {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) throw ApiError.notFound('Product not found');
      return res.json({ success: true, data: product });
    }

    if (req.method === 'PUT') {
      return withAdmin(async (authReq: AuthenticatedRequest, authRes: NextApiResponse) => {
        const parsed = createProductSchema.safeParse(authReq.body);
        if (!parsed.success) return authRes.status(400).json({ success: false, message: parsed.error.issues[0].message });
        const product = await prisma.product.update({
          where: { id },
          data: { ...parsed.data, technicalSpecs: parsed.data.technicalSpecs as Prisma.InputJsonValue },
        });
        return authRes.json({ success: true, message: 'Product updated', data: product });
      })(req as AuthenticatedRequest, res);
    }

    if (req.method === 'DELETE') {
      return withAdmin(async (_authReq: AuthenticatedRequest, authRes: NextApiResponse) => {
        await prisma.product.update({ where: { id }, data: { isActive: false } });
        return authRes.json({ success: true, message: 'Product deleted' });
      })(req as AuthenticatedRequest, res);
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    handleApiError(err, res);
  }
}
