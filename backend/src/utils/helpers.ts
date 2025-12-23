import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';

/**
 * Generate unique order number: ORD-2024-00001
 */
export async function generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const sequence = await prisma.orderSequence.upsert({
        where: { year },
        update: { lastNumber: { increment: 1 } },
        create: { year, lastNumber: 1, prefix: 'ORD' },
    });

    return `ORD-${year}-${sequence.lastNumber.toString().padStart(5, '0')}`;
}

/**
 * Generate unique quote number: RFQ-2024-00001
 */
export async function generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const sequence = await prisma.quoteSequence.upsert({
        where: { year },
        update: { lastNumber: { increment: 1 } },
        create: { year, lastNumber: 1, prefix: 'RFQ' },
    });

    return `RFQ-${year}-${sequence.lastNumber.toString().padStart(5, '0')}`;
}

/**
 * Generate unique invoice number: INV/2024-25/00001
 */
export async function generateInvoiceNumber(financialYear: string, prefix: string = 'INV'): Promise<string> {
    const sequence = await prisma.invoiceSequence.upsert({
        where: { financialYear },
        update: { lastNumber: { increment: 1 } },
        create: { financialYear, lastNumber: 1, prefix },
    });

    return `${prefix}/${financialYear}/${sequence.lastNumber.toString().padStart(5, '0')}`;
}

/**
 * Generate unique sample request number: SMP-2024-00001
 */
export async function generateSampleNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const sequence = await prisma.sampleSequence.upsert({
        where: { year },
        update: { lastNumber: { increment: 1 } },
        create: { year, lastNumber: 1, prefix: 'SMP' },
    });

    return `SMP-${year}-${sequence.lastNumber.toString().padStart(5, '0')}`;
}

/**
 * Generate UUID
 */
export function generateId(): string {
    return uuidv4();
}

/**
 * Pagination helper
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export function getPaginationParams(params: PaginationParams): { skip: number; take: number } {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    return {
        skip: (page - 1) * limit,
        take: limit,
    };
}

export function createPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Generate product code
 */
export function generateProductCode(brand: string, category: string): string {
    const brandPrefix = brand.substring(0, 3).toUpperCase();
    const catPrefix = category.substring(0, 2).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${brandPrefix}-${catPrefix}-${random}`;
}

/**
 * Sanitize object for logging (remove sensitive fields)
 */
export function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'secret'];
    const sanitized = { ...obj };

    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
}

/**
 * Parse boolean from string
 */
export function parseBoolean(value: string | undefined | null): boolean {
    if (!value) return false;
    return ['true', '1', 'yes'].includes(value.toLowerCase());
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
