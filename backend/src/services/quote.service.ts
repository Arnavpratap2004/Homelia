import { prisma } from '../config/database.js';
import { QuoteStatus, Prisma, Role } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';
import { generateQuoteNumber, getPaginationParams, createPaginatedResult, PaginatedResult, roundToTwo } from '../utils/helpers.js';
import { calculateGST, DEFAULT_GST_RATE } from '../utils/gst.js';
import { env } from '../config/env.js';
import { notificationService } from './notification.service.js';

interface QuoteItemInput {
    productId: string;
    requestedQty: number;
    notes?: string;
}

interface CreateQuoteInput {
    items: QuoteItemInput[];
    notes?: string;
}

interface AdminQuotePricing {
    items: {
        quoteItemId: string;
        quotedQty: number;
        quotedPrice: number;
    }[];
    freightCharges?: number;
    discount?: number;
    validUntil: Date;
    adminNotes?: string;
}

interface QuoteListParams {
    userId?: string;
    status?: QuoteStatus;
    page?: number;
    limit?: number;
}

class QuoteService {
    /**
     * Submit a new RFQ
     */
    async create(userId: string, input: CreateQuoteInput): Promise<unknown> {
        // Validate products exist
        const productIds = input.items.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true }
        });

        if (products.length !== productIds.length) {
            throw ApiError.badRequest('One or more products not found');
        }

        // Generate quote number
        const quoteNumber = await generateQuoteNumber();

        // Create quote
        const quote = await prisma.quote.create({
            data: {
                quoteNumber,
                userId,
                status: QuoteStatus.REQUESTED,
                notes: input.notes,
                items: {
                    create: input.items.map(item => ({
                        productId: item.productId,
                        requestedQty: item.requestedQty,
                        notes: item.notes,
                    }))
                }
            },
            include: {
                items: {
                    include: { product: { select: { name: true, productCode: true } } }
                }
            }
        });

        // Notify admin
        await notificationService.notifyNewQuote({
            quoteNumber: quote.quoteNumber,
            userId,
            itemCount: input.items.length
        });

        return quote;
    }

    /**
     * Get quotes with filters
     */
    async list(params: QuoteListParams): Promise<PaginatedResult<unknown>> {
        const { page = 1, limit = 20, ...filters } = params;
        const { skip, take } = getPaginationParams({ page, limit });

        const where: Prisma.QuoteWhereInput = {};
        if (filters.userId) where.userId = filters.userId;
        if (filters.status) where.status = filters.status;

        const [quotes, total] = await Promise.all([
            prisma.quote.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true, companyName: true } },
                    items: {
                        include: { product: { select: { name: true, productCode: true } } }
                    },
                    _count: { select: { items: true } }
                }
            }),
            prisma.quote.count({ where })
        ]);

        return createPaginatedResult(quotes, total, page, limit);
    }

    /**
     * Get quote by ID
     */
    async getById(quoteId: string, userId?: string): Promise<unknown> {
        const quote = await prisma.quote.findUnique({
            where: { id: quoteId },
            include: {
                user: { select: { name: true, email: true, phone: true, companyName: true, gstNumber: true, stateCode: true } },
                items: { include: { product: true } },
                order: true,
            }
        });

        if (!quote) {
            throw ApiError.notFound('Quote not found');
        }

        // If userId provided, verify ownership
        if (userId && quote.userId !== userId) {
            throw ApiError.forbidden('Access denied');
        }

        return quote;
    }

    /**
     * Admin: Update quote with pricing
     */
    async updatePricing(quoteId: string, pricing: AdminQuotePricing): Promise<unknown> {
        const quote = await prisma.quote.findUnique({
            where: { id: quoteId },
            include: { items: true, user: { select: { stateCode: true, gstNumber: true } } }
        });

        if (!quote) {
            throw ApiError.notFound('Quote not found');
        }

        // Calculate totals
        let subtotal = 0;
        const itemUpdates: { id: string; quotedQty: number; quotedPrice: number }[] = [];

        for (const pricingItem of pricing.items) {
            const quoteItem = quote.items.find(i => i.id === pricingItem.quoteItemId);
            if (!quoteItem) {
                throw ApiError.badRequest(`Quote item ${pricingItem.quoteItemId} not found`);
            }

            subtotal += pricingItem.quotedPrice * pricingItem.quotedQty;
            itemUpdates.push({
                id: pricingItem.quoteItemId,
                quotedQty: pricingItem.quotedQty,
                quotedPrice: pricingItem.quotedPrice
            });
        }

        // Calculate GST
        const buyerStateCode = quote.user.stateCode || '27';
        const gst = calculateGST(subtotal, env.sellerStateCode, buyerStateCode);

        const freightCharges = pricing.freightCharges || 0;
        const discount = pricing.discount || 0;
        const totalAmount = roundToTwo(gst.totalAmount + freightCharges - discount);

        // Update quote and items
        const updatedQuote = await prisma.$transaction(async (tx) => {
            // Update quote items
            for (const item of itemUpdates) {
                await tx.quoteItem.update({
                    where: { id: item.id },
                    data: { quotedQty: item.quotedQty, quotedPrice: item.quotedPrice }
                });
            }

            // Update quote
            return tx.quote.update({
                where: { id: quoteId },
                data: {
                    status: QuoteStatus.QUOTED,
                    subtotal,
                    totalTax: gst.totalTax,
                    freightCharges,
                    discount,
                    totalAmount,
                    validUntil: pricing.validUntil,
                    adminNotes: pricing.adminNotes,
                },
                include: { items: { include: { product: true } } }
            });
        });

        // Notify user
        await notificationService.notifyQuoteStatusUpdate(quote.userId, {
            quoteNumber: quote.quoteNumber,
            status: QuoteStatus.QUOTED
        });

        return updatedQuote;
    }

    /**
     * Admin: Approve quote
     */
    async approve(quoteId: string): Promise<unknown> {
        const quote = await prisma.quote.update({
            where: { id: quoteId },
            data: { status: QuoteStatus.APPROVED },
            include: { user: true }
        });

        await notificationService.notifyQuoteStatusUpdate(quote.userId, {
            quoteNumber: quote.quoteNumber,
            status: QuoteStatus.APPROVED
        });

        return quote;
    }

    /**
     * Admin: Reject quote
     */
    async reject(quoteId: string, reason: string): Promise<unknown> {
        const quote = await prisma.quote.update({
            where: { id: quoteId },
            data: {
                status: QuoteStatus.REJECTED,
                rejectionReason: reason
            },
            include: { user: true }
        });

        await notificationService.notifyQuoteStatusUpdate(quote.userId, {
            quoteNumber: quote.quoteNumber,
            status: QuoteStatus.REJECTED
        });

        return quote;
    }

    /**
     * Convert approved quote to order
     */
    async convertToOrder(quoteId: string, userId: string, shippingAddress: Record<string, unknown>, billingAddress: Record<string, unknown>): Promise<unknown> {
        const quote = await prisma.quote.findUnique({
            where: { id: quoteId },
            include: { items: { include: { product: true } } }
        });

        if (!quote) {
            throw ApiError.notFound('Quote not found');
        }

        if (quote.userId !== userId) {
            throw ApiError.forbidden('Access denied');
        }

        if (quote.status !== QuoteStatus.APPROVED) {
            throw ApiError.badRequest('Quote must be approved before conversion');
        }

        if (quote.validUntil && quote.validUntil < new Date()) {
            throw ApiError.badRequest('Quote has expired');
        }

        // Import order service dynamically to avoid circular dependency
        const { orderService } = await import('./order.service.js');

        // Build order items from quoted prices
        const orderItems = quote.items.map(item => ({
            productId: item.productId,
            quantity: item.quotedQty || item.requestedQty,
        }));

        // Create order with quote reference
        const order = await orderService.create(userId, Role.B2B_CUSTOMER, {
            items: orderItems,
            shippingAddress,
            billingAddress,
            quoteId,
        });

        // Update quote status
        await prisma.quote.update({
            where: { id: quoteId },
            data: { status: QuoteStatus.CONVERTED }
        });

        return order;
    }

    /**
     * Get user's quotes
     */
    async getUserQuotes(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<unknown>> {
        return this.list({ userId, page, limit });
    }
}

export const quoteService = new QuoteService();
