import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { productService } from '../services/product.service.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Brand, Category, Finish } from '@prisma/client';

const router = Router();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    brand: z.nativeEnum(Brand).optional(),
    category: z.nativeEnum(Category).optional(),
    finish: z.nativeEnum(Finish).optional(),
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

const idParamSchema = z.object({
    id: z.string().uuid(),
});

const createProductSchema = z.object({
    name: z.string().min(2),
    productCode: z.string().min(3),
    brand: z.nativeEnum(Brand),
    category: z.nativeEnum(Category),
    collection: z.string().optional(),
    finish: z.nativeEnum(Finish),
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
});

const updateStockSchema = z.object({
    quantity: z.number().int().min(0),
});

// GET /api/products - List products with filters
router.get('/',
    validateQuery(listQuerySchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = await productService.list(req.query as never);
        res.json({
            success: true,
            ...result,
        });
    })
);

// GET /api/products/featured - Get featured products
router.get('/featured',
    asyncHandler(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 10;
        const products = await productService.getFeatured(limit);
        res.json({
            success: true,
            data: products,
        });
    })
);

// GET /api/products/bestsellers - Get bestsellers
router.get('/bestsellers',
    asyncHandler(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 10;
        const products = await productService.getBestsellers(limit);
        res.json({
            success: true,
            data: products,
        });
    })
);

// GET /api/products/collections - Get unique collections
router.get('/collections',
    asyncHandler(async (req: Request, res: Response) => {
        const brand = req.query.brand as Brand | undefined;
        const collections = await productService.getCollections(brand);
        res.json({
            success: true,
            data: collections,
        });
    })
);

// GET /api/products/brand/:brand - Get products by brand
router.get('/brand/:brand',
    asyncHandler(async (req: Request, res: Response) => {
        const brand = req.params.brand.toUpperCase() as Brand;
        const limit = Number(req.query.limit) || 20;
        const products = await productService.getByBrand(brand, limit);
        res.json({
            success: true,
            data: products,
        });
    })
);

// GET /api/products/:id - Get product by ID
router.get('/:id',
    validateParams(idParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const product = await productService.getById(req.params.id);
        res.json({
            success: true,
            data: product,
        });
    })
);

// POST /api/products - Create product (Admin)
router.post('/',
    authenticate,
    requireAdmin,
    validateBody(createProductSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const product = await productService.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created',
            data: product,
        });
    })
);

// PUT /api/products/:id - Update product (Admin)
router.put('/:id',
    authenticate,
    requireAdmin,
    validateParams(idParamSchema),
    validateBody(createProductSchema.partial()),
    asyncHandler(async (req: Request, res: Response) => {
        const product = await productService.update(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Product updated',
            data: product,
        });
    })
);

// PATCH /api/products/:id/stock - Update stock (Admin)
router.patch('/:id/stock',
    authenticate,
    requireAdmin,
    validateParams(idParamSchema),
    validateBody(updateStockSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await productService.updateStock(req.params.id, req.body.quantity);
        res.json({
            success: true,
            message: 'Stock updated',
        });
    })
);

// DELETE /api/products/:id - Delete product (Admin)
router.delete('/:id',
    authenticate,
    requireAdmin,
    validateParams(idParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await productService.delete(req.params.id);
        res.json({
            success: true,
            message: 'Product deleted',
        });
    })
);

export default router;
