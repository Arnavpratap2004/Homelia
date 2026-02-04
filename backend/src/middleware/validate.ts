import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

interface ValidationTarget {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

// Validate request body, query, params using Zod schemas
export function validate(schemas: ValidationTarget) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
}

// Helper to validate just body
export function validateBody(schema: ZodSchema) {
    return validate({ body: schema });
}

// Helper to validate just query
export function validateQuery(schema: ZodSchema) {
    return validate({ query: schema });
}

// Helper to validate just params
export function validateParams(schema: ZodSchema) {
    return validate({ params: schema });
}
