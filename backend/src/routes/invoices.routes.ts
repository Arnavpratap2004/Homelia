import { Router, Response } from 'express';
import { z } from 'zod';
import { invoiceService } from '../services/invoice.service.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireOwnerOrAdmin } from '../middleware/roles.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { InvoiceType } from '@prisma/client';

const router = Router();

// Validation schemas
const idParamSchema = z.object({
    id: z.string().uuid(),
});

const orderIdParamSchema = z.object({
    orderId: z.string().uuid(),
});

const quoteIdParamSchema = z.object({
    quoteId: z.string().uuid(),
});

const listQuerySchema = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    financialYear: z.string().optional(),
    invoiceType: z.nativeEnum(InvoiceType).optional(),
});

const gstReportSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});

// GET /api/invoices - List invoices (Admin)
router.get('/',
    authenticate,
    requireAdmin,
    validateQuery(listQuerySchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const result = await invoiceService.list(req.query as never);
        res.json({
            success: true,
            ...result,
        });
    })
);

// GET /api/invoices/gst-report - Get GST report (Admin)
router.get('/gst-report',
    authenticate,
    requireAdmin,
    validateQuery(gstReportSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { startDate, endDate } = req.query as unknown as { startDate: Date; endDate: Date };
        const report = await invoiceService.getGSTReport(startDate, endDate);
        res.json({
            success: true,
            data: report,
        });
    })
);

// GET /api/invoices/my-invoices - List my invoices
router.get('/my-invoices',
    authenticate,
    validateQuery(listQuerySchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            throw new Error('User not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await invoiceService.listMyInvoices((req.user as any).id, req.query as never);
        res.json({
            success: true,
            ...result,
        });
    })
);

// GET /api/invoices/order/:orderId - Get invoices for order
router.get('/order/:orderId',
    authenticate,
    validateParams(orderIdParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const invoices = await invoiceService.getForOrder(req.params.orderId);
        res.json({
            success: true,
            data: invoices,
        });
    })
);

// GET /api/invoices/:id - Get invoice by ID
router.get('/:id',
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const invoice = await invoiceService.getById(req.params.id);
        res.json({
            success: true,
            data: invoice,
        });
    })
);

// POST /api/invoices/generate/:orderId - Generate tax invoice (Admin)
router.post('/generate/:orderId',
    authenticate,
    requireAdmin,
    validateParams(orderIdParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const invoice = await invoiceService.generateTaxInvoice(req.params.orderId);
        res.status(201).json({
            success: true,
            message: 'Tax invoice generated',
            data: invoice,
        });
    })
);

// POST /api/invoices/proforma/:quoteId - Generate proforma invoice (Admin)
router.post('/proforma/:quoteId',
    authenticate,
    requireAdmin,
    validateParams(quoteIdParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const invoice = await invoiceService.generateProformaInvoice(req.params.quoteId);
        res.status(201).json({
            success: true,
            message: 'Proforma invoice generated',
            data: invoice,
        });
    })
);

export default router;
