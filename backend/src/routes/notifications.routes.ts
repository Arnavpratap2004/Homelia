import { Router, Response } from 'express';
import { z } from 'zod';
import { notificationService } from '../services/notification.service.js';
import { validateParams } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const idParamSchema = z.object({
    id: z.string().uuid(),
});

// GET /api/notifications - Get user's notifications
router.get('/',
    authenticate,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const limit = Number(req.query.limit) || 20;
        const notifications = await notificationService.getForUser(req.user!.userId, limit);
        res.json({
            success: true,
            data: notifications,
        });
    })
);

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count',
    authenticate,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const count = await notificationService.getUnreadCount(req.user!.userId);
        res.json({
            success: true,
            data: { count },
        });
    })
);

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read',
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await notificationService.markAsRead(req.params.id);
        res.json({
            success: true,
            message: 'Notification marked as read',
        });
    })
);

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all',
    authenticate,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await notificationService.markAllAsRead(req.user!.userId);
        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    })
);

export default router;
