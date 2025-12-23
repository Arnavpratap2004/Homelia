import { Router, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    companyName: z.string().optional(),
    gstNumber: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
    refreshToken: z.string(),
});

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    companyName: z.string().optional(),
    gstNumber: z.string().optional(),
    billingAddress: z.record(z.unknown()).optional(),
    shippingAddress: z.record(z.unknown()).optional(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
});

// POST /api/auth/register
router.post('/register',
    validateBody(registerSchema),
    asyncHandler(async (req, res: Response) => {
        const result = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: result,
        });
    })
);

// POST /api/auth/login
router.post('/login',
    validateBody(loginSchema),
    asyncHandler(async (req, res: Response) => {
        const result = await authService.login(req.body);
        res.json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    })
);

// POST /api/auth/refresh
router.post('/refresh',
    validateBody(refreshSchema),
    asyncHandler(async (req, res: Response) => {
        const tokens = await authService.refreshTokens(req.body.refreshToken);
        res.json({
            success: true,
            data: tokens,
        });
    })
);

// POST /api/auth/logout
router.post('/logout',
    authenticate,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await authService.logout(req.user!.userId);
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    })
);

// GET /api/auth/me
router.get('/me',
    authenticate,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = await authService.getProfile(req.user!.userId);
        res.json({
            success: true,
            data: user,
        });
    })
);

// PUT /api/auth/profile
router.put('/profile',
    authenticate,
    validateBody(updateProfileSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = await authService.updateProfile(req.user!.userId, req.body);
        res.json({
            success: true,
            message: 'Profile updated',
            data: user,
        });
    })
);

// POST /api/auth/change-password
router.post('/change-password',
    authenticate,
    validateBody(changePasswordSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await authService.changePassword(
            req.user!.userId,
            req.body.currentPassword,
            req.body.newPassword
        );
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    })
);

export default router;
