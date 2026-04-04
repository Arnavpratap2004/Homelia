import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';
import { getPaginationParams, createPaginatedResult } from '../../../lib/helpers';
import { Prisma } from '@prisma/client';

const listQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  brand: z.enum(['DURIAN', 'ROCKSTAR']).optional(),
  category: z.enum(['DECORATIVE', 'COMPACT', 'EXTERIOR', 'FIRE_RETARDANT', 'ANTI_BACTERIAL']).optional(),
  finish: z.enum(['MATTE', 'GLOSSY', 'SUEDE', 'TEXTURED', 'HIGH_GLOSS', 'SILK', 'METALLIC']).optional(),
  collection: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

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
  technicalSpecs: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = parsed.data;
      const { skip, take } = getPaginationParams({ page, limit });

      const where: any = { isActive: true };
      if (filters.brand) where.brand = filters.brand;
      if (filters.category) where.category = filters.category;
      if (filters.finish) where.finish = filters.finish;
      if (filters.collection) where.collection = filters.collection;
      if (filters.featured !== undefined) where.isFeatured = filters.featured;
      if (filters.bestseller !== undefined) where.isBestseller = filters.bestseller;
      if (filters.inStock) where.stockQuantity = { gt: 0 };
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { productCode: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = filters.minPrice;
        if (filters.maxPrice) where.price.lte = filters.maxPrice;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where, skip, take, orderBy: { [sortBy]: sortOrder },
          select: {
            id: true, name: true, productCode: true, brand: true, category: true,
            collection: true, finish: true, texture: true, thickness: true, sheetSize: true,
            price: true, isPriceOnRequest: true, moq: true, stockQuantity: true,
            images: true, colors: true, isFeatured: true, isBestseller: true,
          },
        }),
        prisma.product.count({ where }),
      ]);

      return res.json({ success: true, ...createPaginatedResult(products, total, page, limit) });
    }

    if (req.method === 'POST') {
      // Admin-only create product
      return withAdmin(async (authReq: AuthenticatedRequest, authRes: NextApiResponse) => {
        const parsed = createProductSchema.safeParse(authReq.body);
        if (!parsed.success) return authRes.status(400).json({ success: false, message: parsed.error.issues[0].message });

        const product = await prisma.product.create({
          data: { ...parsed.data, technicalSpecs: parsed.data.technicalSpecs as any },
        });

        return authRes.status(201).json({ success: true, message: 'Product created', data: product });
      })(req as AuthenticatedRequest, res);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    handleApiError(err, res);
  }
}
