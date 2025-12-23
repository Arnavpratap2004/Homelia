import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config/index.js';

// Custom error class for API errors
export class ApiError extends Error {
    statusCode: number;
    code?: string;

    constructor(statusCode: number, message: string, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ApiError';
    }

    static badRequest(message: string, code?: string): ApiError {
        return new ApiError(400, message, code);
    }

    static unauthorized(message: string = 'Unauthorized', code?: string): ApiError {
        return new ApiError(401, message, code);
    }

    static forbidden(message: string = 'Forbidden', code?: string): ApiError {
        return new ApiError(403, message, code);
    }

    static notFound(message: string = 'Not found', code?: string): ApiError {
        return new ApiError(404, message, code);
    }

    static conflict(message: string, code?: string): ApiError {
        return new ApiError(409, message, code);
    }

    static internal(message: string = 'Internal server error', code?: string): ApiError {
        return new ApiError(500, message, code);
    }
}

// Global error handler
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: isProduction ? undefined : err.stack,
        path: req.path,
        method: req.method,
    });

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as { code: string; meta?: { target?: string[] } };

        if (prismaError.code === 'P2002') {
            const field = prismaError.meta?.target?.[0] || 'field';
            res.status(409).json({
                success: false,
                message: `A record with this ${field} already exists`,
                code: 'DUPLICATE_ENTRY',
            });
            return;
        }

        if (prismaError.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Record not found',
                code: 'NOT_FOUND',
            });
            return;
        }
    }

    // Default error response
    res.status(500).json({
        success: false,
        message: isProduction ? 'An unexpected error occurred' : err.message,
        ...(isProduction ? {} : { stack: err.stack }),
    });
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        code: 'ROUTE_NOT_FOUND',
    });
}

// Async handler wrapper to catch errors
export function asyncHandler<T>(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
