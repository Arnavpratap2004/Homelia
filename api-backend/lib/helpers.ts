import { prisma } from './prisma';

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
 * Pagination helpers
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
  return { skip: (page - 1) * limit, take: limit };
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
 * Role-based pricing
 */
export function getPriceForRole(
  role: string | undefined,
  retailPrice: number | null,
  b2bPrice: number | null,
  dealerPrice: number | null
): number | null {
  switch (role) {
    case 'ADMIN':
    case 'DEALER':
      return dealerPrice ?? b2bPrice ?? retailPrice;
    case 'B2B_CUSTOMER':
      return b2bPrice ?? retailPrice;
    default:
      return retailPrice;
  }
}
