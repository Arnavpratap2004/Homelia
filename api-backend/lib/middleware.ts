import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken, AuthPayload } from './auth';
import { prisma } from './prisma';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthPayload;
}

type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void>;

/**
 * Middleware wrapper: require valid JWT token
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = { userId: user.id, role: user.role };
    return handler(req, res);
  };
}

/**
 * Middleware wrapper: require admin role
 */
export function withAdmin(handler: ApiHandler): ApiHandler {
  return withAuth(async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    return handler(req, res);
  });
}

/**
 * Middleware wrapper: require specific role(s)
 */
export function withRole(...roles: string[]) {
  return (handler: ApiHandler): ApiHandler => {
    return withAuth(async (req, res) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }
      return handler(req, res);
    });
  };
}

/**
 * Helper to restrict HTTP methods
 */
export function allowMethods(methods: string[]) {
  return (req: NextApiRequest, res: NextApiResponse): boolean => {
    if (!methods.includes(req.method || '')) {
      res.setHeader('Allow', methods.join(', '));
      res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
      return false;
    }
    return true;
  };
}
