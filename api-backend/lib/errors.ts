import type { NextApiResponse } from 'next';

export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }

  static badRequest(message: string, code?: string) {
    return new ApiError(400, message, code);
  }
  static unauthorized(message: string = 'Unauthorized', code?: string) {
    return new ApiError(401, message, code);
  }
  static forbidden(message: string = 'Forbidden', code?: string) {
    return new ApiError(403, message, code);
  }
  static notFound(message: string = 'Not found', code?: string) {
    return new ApiError(404, message, code);
  }
  static conflict(message: string, code?: string) {
    return new ApiError(409, message, code);
  }
  static internal(message: string = 'Internal server error', code?: string) {
    return new ApiError(500, message, code);
  }
}

export function handleApiError(err: unknown, res: NextApiResponse) {
  console.error('API Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Handle Prisma errors
  const prismaErr = err as { name?: string; code?: string; meta?: { target?: string[] } };
  if (prismaErr.name === 'PrismaClientKnownRequestError') {
    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists`,
        code: 'DUPLICATE_ENTRY',
      });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : String(err),
  });
}
