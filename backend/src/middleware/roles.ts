import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from './auth.js';

// Check if user has required role(s)
export function requireRole(...allowedRoles: Role[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
}

// Shortcut for admin-only routes
export const requireAdmin = requireRole(Role.ADMIN);

// Shortcut for dealer and above
export const requireDealer = requireRole(Role.ADMIN, Role.DEALER);

// Shortcut for B2B customers and above
export const requireB2B = requireRole(Role.ADMIN, Role.DEALER, Role.B2B_CUSTOMER);

// Check if user is owner of resource or admin
export function requireOwnerOrAdmin(getUserId: (req: AuthenticatedRequest) => string | null) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        // Admins can access anything
        if (req.user.role === Role.ADMIN) {
            next();
            return;
        }

        const resourceUserId = getUserId(req);

        if (!resourceUserId || resourceUserId !== req.user.userId) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        next();
    };
}

// Role hierarchy check
const roleHierarchy: Record<Role, number> = {
    [Role.RETAIL_CUSTOMER]: 0,
    [Role.B2B_CUSTOMER]: 1,
    [Role.DEALER]: 2,
    [Role.ADMIN]: 3,
};

export function hasEqualOrHigherRole(userRole: Role, requiredRole: Role): boolean {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Get price based on user role
export function getPriceForRole(
    role: Role | undefined,
    retailPrice: number | null,
    b2bPrice: number | null,
    dealerPrice: number | null
): number | null {
    switch (role) {
        case Role.ADMIN:
        case Role.DEALER:
            return dealerPrice ?? b2bPrice ?? retailPrice;
        case Role.B2B_CUSTOMER:
            return b2bPrice ?? retailPrice;
        default:
            return retailPrice;
    }
}
