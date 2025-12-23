import { Router, Response } from 'express';
import { z } from 'zod';
import { quoteService } from '../services/quote.service.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { QuoteStatus } from '@prisma/client';

const router = Router();

// Validation schemas
const createQuoteSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        requestedQty: z.number().int().min(1),
        notes: z.string().optional(),
    })).min(1),
    notes: z.string().optional(),
});

const listQuerySchema = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    status: z.nativeEnum(QuoteStatus).optional(),
});

const idParamSchema = z.object({
    id: z.string().uuid(),
});

const pricingSchema = z.object({
    items: z.array(z.object({
        quoteItemId: z.string().uuid(),
        quotedQty: z.number().int().min(1),
        quotedPrice: z.number().min(0),
    })),
    freightCharges: z.number().optional(),
    discount: z.number().optional(),
    validUntil: z.coerce.date(),
    adminNotes: z.string().optional(),
});

const rejectSchema = z.object({
    reason: z.string().min(1),
});

const convertSchema = z.object({
    shippingAddress: z.record(z.unknown()),
    billingAddress: z.record(z.unknown()),
});

// POST /api/quotes - Submit RFQ
router.post('/',
    authenticate,
    validateBody(createQuoteSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const quote = await quoteService.create(req.user!.userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Quote request submitted',
            data: quote,
        });
    })
);

// GET /api/quotes - Get user's quotes
router.get('/',
    authenticate,
    validateQuery(listQuerySchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { page, limit, ...filters } = req.query as never;
        const isAdmin = req.user!.role === 'ADMIN';

        const result = await quoteService.list({
            userId: isAdmin ? undefined : req.user!.userId,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            ...filters,
        });

        res.json({
            success: true,
            ...result,
        });
    })
);

// GET /api/quotes/:id - Get quote by ID
router.get('/:id',
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const isAdmin = req.user!.role === 'ADMIN';
        const quote = await quoteService.getById(
            req.params.id,
            isAdmin ? undefined : req.user!.userId
        );
        res.json({
            success: true,
            data: quote,
        });
    })
);

// PATCH /api/quotes/:id/pricing - Update quote pricing (Admin)
router.patch('/:id/pricing',
    authenticate,
    requireAdmin,
    validateParams(idParamSchema),
    validateBody(pricingSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const quote = await quoteService.updatePricing(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Quote pricing updated',
            data: quote,
        });
    })
);

// PATCH /api/quotes/:id/approve - Approve quote (Admin)
router.patch('/:id/approve',
    authenticate,
    requireAdmin,
    validateParams(idParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const quote = await quoteService.approve(req.params.id);
        res.json({
            success: true,
            message: 'Quote approved',
            data: quote,
        });
    })
);

// PATCH /api/quotes/:id/reject - Reject quote (Admin)
router.patch('/:id/reject',
    authenticate,
    requireAdmin,
    validateParams(idParamSchema),
    validateBody(rejectSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const quote = await quoteService.reject(req.params.id, req.body.reason);
        res.json({
            success: true,
            message: 'Quote rejected',
            data: quote,
        });
    })
);

// POST /api/quotes/:id/convert - Convert quote to order
router.post('/:id/convert',
    authenticate,
    validateParams(idParamSchema),
    validateBody(convertSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const order = await quoteService.convertToOrder(
            req.params.id,
            req.user!.userId,
            req.body.shippingAddress,
            req.body.billingAddress
        );
        res.status(201).json({
            success: true,
            message: 'Quote converted to order',
            data: order,
        });
    })
);

export default router;
