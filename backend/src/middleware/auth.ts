import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import { prisma } from '../config/database.js';
import { Role } from '@prisma/client';

export interface AuthPayload {
    userId: string;
    role: Role;
}

export interface AuthenticatedRequest extends Request {
    user?: AuthPayload;
}

// Verify JWT and attach user to request
export async function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;

        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, isActive: true }
        });

        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }

        req.user = {
            userId: user.id,
            role: user.role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;

        req.user = decoded;
        next();
    } catch {
        // Silently continue without auth
        next();
    }
}

// Generate access token
export function generateAccessToken(userId: string, role: Role): string {
    return jwt.sign(
        { userId, role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );
}

// Generate refresh token
export function generateRefreshToken(userId: string): string {
    return jwt.sign(
        { userId, type: 'refresh' },
        env.jwtRefreshSecret,
        { expiresIn: env.jwtRefreshExpiresIn }
    );
}

// Verify refresh token
export function verifyRefreshToken(token: string): { userId: string } | null {
    try {
        const decoded = jwt.verify(token, env.jwtRefreshSecret) as { userId: string; type: string };
        if (decoded.type !== 'refresh') return null;
        return { userId: decoded.userId };
    } catch {
        return null;
    }
}
