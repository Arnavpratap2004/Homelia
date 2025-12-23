import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { orderService } from '../services/order.service.js';
import { quoteService } from '../services/quote.service.js';
import { validateQuery } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { OrderStatus, QuoteStatus, PaymentStatus } from '@prisma/client';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard',
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalOrders,
            pendingOrders,
            todayOrders,
            pendingQuotes,
            pendingPayments,
            lowStockProducts,
            totalRevenue,
            unreadNotifications,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: OrderStatus.PENDING } }),
            prisma.order.count({ where: { createdAt: { gte: today } } }),
            prisma.quote.count({ where: { status: { in: [QuoteStatus.REQUESTED, QuoteStatus.UNDER_REVIEW] } } }),
            prisma.order.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
            prisma.product.count({ where: { stockQuantity: { lt: 10 }, isActive: true } }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { paymentStatus: PaymentStatus.PAID }
            }),
            prisma.notification.count({ where: { isRead: false, recipientRole: 'ADMIN' } }),
        ]);

        res.json({
            success: true,
            data: {
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    today: todayOrders,
                },
                quotes: {
                    pending: pendingQuotes,
                },
                payments: {
                    pending: pendingPayments,
                },
                inventory: {
                    lowStock: lowStockProducts,
                },
                revenue: {
                    total: totalRevenue._sum.totalAmount?.toNumber() || 0,
                },
                notifications: {
                    unread: unreadNotifications,
                },
            },
        });
    })
);

// GET /api/admin/orders - All orders with filters
router.get('/orders',
    validateQuery(z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    })),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const result = await orderService.list(req.query as never);
        res.json({
            success: true,
            ...result,
        });
    })
);

// GET /api/admin/quotes - All quotes with filters
router.get('/quotes',
    validateQuery(z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        status: z.nativeEnum(QuoteStatus).optional(),
    })),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const result = await quoteService.list(req.query as never);
        res.json({
            success: true,
            ...result,
        });
    })
);

// GET /api/admin/users - All users
router.get('/users',
    validateQuery(z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        role: z.string().optional(),
    })),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const where = req.query.role ? { role: req.query.role as never } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    name: true,
                    role: true,
                    companyName: true,
                    gstNumber: true,
                    isVerified: true,
                    isActive: true,
                    createdAt: true,
                    _count: { select: { orders: true, quotes: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    })
);

// GET /api/admin/reports/sales - Sales report
router.get('/reports/sales',
    validateQuery(z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        groupBy: z.enum(['day', 'month', 'brand']).optional(),
    })),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { startDate, endDate } = req.query as { startDate: Date; endDate: Date };

        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                paymentStatus: PaymentStatus.PAID,
            },
            include: {
                items: { include: { product: { select: { brand: true } } } }
            }
        });

        const summary = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount.toNumber(), 0),
            totalTax: orders.reduce((sum, o) => sum + o.totalTax.toNumber(), 0),
            byBrand: {} as Record<string, { orders: number; revenue: number }>,
        };

        // Group by brand
        for (const order of orders) {
            for (const item of order.items) {
                const brand = item.product.brand;
                if (!summary.byBrand[brand]) {
                    summary.byBrand[brand] = { orders: 0, revenue: 0 };
                }
                summary.byBrand[brand].orders++;
                summary.byBrand[brand].revenue += item.totalPrice.toNumber();
            }
        }

        res.json({
            success: true,
            data: {
                period: { startDate, endDate },
                summary,
            },
        });
    })
);

// PATCH /api/admin/users/:id/role - Update user role
router.patch('/users/:id/role',
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { role } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, email: true, name: true, role: true }
        });
        res.json({
            success: true,
            message: 'User role updated',
            data: user,
        });
    })
);

// PATCH /api/admin/users/:id/status - Activate/Deactivate user
router.patch('/users/:id/status',
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { isActive } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive },
            select: { id: true, email: true, name: true, isActive: true }
        });
        res.json({
            success: true,
            message: isActive ? 'User activated' : 'User deactivated',
            data: user,
        });
    })
);

export default router;
