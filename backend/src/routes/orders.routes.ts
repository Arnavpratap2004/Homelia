import { Router, Response } from 'express';
import { z } from 'zod';
import { orderService } from '../services/order.service.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const router = Router();

// Validation schemas
const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
    })).min(1),
    shippingAddress: z.record(z.unknown()),
    billingAddress: z.record(z.unknown()),
    notes: z.string().optional(),
    quoteId: z.string().uuid().optional(),
});

const listQuerySchema = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
});

const idParamSchema = z.object({
    id: z.string().uuid(),
});

const updateStatusSchema = z.object({
    status: z.nativeEnum(OrderStatus),
    adminNotes: z.string().optional(),
});

// POST /api/orders - Create order
router.post('/',
    authenticate,
    validateBody(createOrderSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const order = await orderService.create(req.user!.userId, req.user!.role, req.body);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order,
        });
    })
);

// GET /api/orders - Get user's orders (or all orders for admin)
router.get('/',
    authenticate,
    validateQuery(listQuerySchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { page, limit, ...filters } = req.query as never;
        const isAdmin = req.user!.role === 'ADMIN';

        const result = await orderService.list({
            // Admins see all orders, users see only their own
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

// GET /api/orders/:id - Get order by ID
router.get('/:id',
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const isAdmin = req.user!.role === 'ADMIN';
        const order = await orderService.getById(
            req.params.id,
            isAdmin ? undefined : req.user!.userId
        );
        res.json({
            success: true,
            data: order,
        });
    })
);

// PATCH /api/orders/:id/status - Update order status (Admin)
router.patch('/:id/status',
    authenticate,
    requireAdmin,
    validateParams(idParamSchema),
    validateBody(updateStatusSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const order = await orderService.updateStatus(
            req.params.id,
            req.body.status,
            req.body.adminNotes
        );
        res.json({
            success: true,
            message: 'Order status updated',
            data: order,
        });
    })
);

// PATCH /api/orders/:id/cancel - Cancel order
router.patch('/:id/cancel',
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const isAdmin = req.user!.role === 'ADMIN';
        await orderService.cancel(req.params.id, req.user!.userId, isAdmin);
        res.json({
            success: true,
            message: 'Order cancelled',
        });
    })
);

export default router;
