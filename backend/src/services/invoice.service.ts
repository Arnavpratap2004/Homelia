import { prisma } from '../config/database.js';
import { InvoiceType, Prisma } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';
import { generateInvoiceNumber, getPaginationParams, createPaginatedResult, PaginatedResult } from '../utils/helpers.js';
import { getFinancialYear, amountInWords } from '../utils/gst.js';
import { env } from '../config/env.js';

class InvoiceService {
    /**
     * Generate tax invoice for an order
     */
    async generateTaxInvoice(orderId: string): Promise<unknown> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: { include: { product: true } }
            }
        });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        // Check if invoice already exists
        const existingInvoice = await prisma.invoice.findFirst({
            where: { orderId, invoiceType: InvoiceType.TAX_INVOICE }
        });

        if (existingInvoice) {
            throw ApiError.conflict('Tax invoice already exists for this order');
        }

        // Generate invoice number
        const financialYear = getFinancialYear();
        const invoiceNumber = await generateInvoiceNumber(financialYear, 'INV');

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                financialYear,
                invoiceType: InvoiceType.TAX_INVOICE,
                orderId,
                subtotal: order.subtotal,
                cgst: order.cgst,
                sgst: order.sgst,
                igst: order.igst,
                totalTax: order.totalTax,
                freightCharges: order.freightCharges,
                discount: order.discount,
                totalAmount: order.totalAmount,
                buyerName: order.user.companyName || order.user.name,
                buyerGstin: order.user.gstNumber,
                buyerStateCode: order.user.stateCode,
                buyerAddress: order.billingAddress,
                sellerGstin: env.sellerGstin,
                sellerStateCode: env.sellerStateCode,
                sellerAddress: {
                    name: env.sellerName,
                    address: env.sellerAddress,
                    phone: env.sellerPhone,
                    email: env.sellerEmail,
                },
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
            }
        });

        return invoice;
    }

    /**
     * Generate proforma invoice for a quote
     */
    async generateProformaInvoice(quoteId: string): Promise<unknown> {
        const quote = await prisma.quote.findUnique({
            where: { id: quoteId },
            include: {
                user: true,
                items: { include: { product: true } },
                order: true
            }
        });

        if (!quote) {
            throw ApiError.notFound('Quote not found');
        }

        if (!quote.totalAmount) {
            throw ApiError.badRequest('Quote has not been priced yet');
        }

        // Check if an order already exists for this quote, if not create a PENDING one
        let orderId = quote.order?.id;

        if (!orderId) {
            // Create a pending order for this quote to satisfy foreign key constraint
            const { generateOrderNumber } = await import('../utils/helpers.js'); // Lazy import to avoid circular dep if any
            const orderNumber = await generateOrderNumber();

            const newOrder = await prisma.order.create({
                data: {
                    orderNumber,
                    userId: quote.userId,
                    quoteId: quote.id,
                    status: 'PENDING',
                    subtotal: quote.subtotal || 0,
                    totalTax: quote.totalTax || 0,
                    freightCharges: quote.freightCharges || 0,
                    discount: quote.discount || 0,
                    totalAmount: quote.totalAmount,
                    billingAddress: quote.user.billingAddress || {},
                    shippingAddress: quote.user.shippingAddress || quote.user.billingAddress || {},
                    // Default taxes to 0 if not calculated yet, will be updated when finalized
                    cgst: 0,
                    sgst: 0,
                    igst: 0
                }
            });
            orderId = newOrder.id;
        }

        // Generate invoice number
        const financialYear = getFinancialYear();
        const invoiceNumber = await generateInvoiceNumber(financialYear, 'PRO');

        // Calculate GST breakdown (estimate for proforma)
        const gstRate = 0.18;
        const subtotal = quote.subtotal?.toNumber() || 0;
        const totalTax = quote.totalTax?.toNumber() || subtotal * gstRate;

        // Create proforma invoice
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                financialYear,
                invoiceType: InvoiceType.PROFORMA,
                orderId: orderId,
                subtotal: quote.subtotal || 0,
                cgst: totalTax / 2,
                sgst: totalTax / 2,
                igst: 0,
                totalTax: quote.totalTax || 0,
                freightCharges: quote.freightCharges || 0,
                discount: quote.discount || 0,
                totalAmount: quote.totalAmount,
                buyerName: quote.user.companyName || quote.user.name,
                buyerGstin: quote.user.gstNumber,
                buyerStateCode: quote.user.stateCode,
                buyerAddress: (quote.user.billingAddress || {}) as Prisma.InputJsonValue,
                sellerGstin: env.sellerGstin,
                sellerStateCode: env.sellerStateCode,
                sellerAddress: {
                    name: env.sellerName,
                    address: env.sellerAddress,
                    phone: env.sellerPhone,
                    email: env.sellerEmail,
                },
                dueDate: quote.validUntil,
            }
        });

        return invoice;
    }

    /**
     * Get invoice by ID
     */
    async getById(invoiceId: string): Promise<unknown> {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                order: {
                    include: {
                        items: { include: { product: true } },
                        user: true,
                    }
                }
            }
        });

        if (!invoice) {
            throw ApiError.notFound('Invoice not found');
        }

        // Add amount in words
        return {
            ...invoice,
            amountInWords: amountInWords(invoice.totalAmount.toNumber()),
        };
    }

    /**
     * Get invoices for an order
     */
    async getForOrder(orderId: string): Promise<unknown[]> {
        return prisma.invoice.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * List invoices (Admin)
     */
    async list(params: {
        page?: number;
        limit?: number;
        financialYear?: string;
        invoiceType?: InvoiceType;
    }): Promise<PaginatedResult<unknown>> {
        const { page = 1, limit = 20, financialYear, invoiceType } = params;
        const { skip, take } = getPaginationParams({ page, limit });

        const where: Prisma.InvoiceWhereInput = {};
        if (financialYear) where.financialYear = financialYear;
        if (invoiceType) where.invoiceType = invoiceType;

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take,
                orderBy: { issuedAt: 'desc' },
                include: {
                    order: { select: { orderNumber: true, user: { select: { name: true, companyName: true } } } }
                }
            }),
            prisma.invoice.count({ where })
        ]);

        return createPaginatedResult(invoices, total, page, limit);
    }

    /**
     * List my invoices (User)
     */
    async listMyInvoices(userId: string, params: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResult<unknown>> {
        const { page = 1, limit = 20 } = params;
        const { skip, take } = getPaginationParams({ page, limit });

        const where: Prisma.InvoiceWhereInput = {
            order: {
                userId: userId
            }
        };

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take,
                orderBy: { issuedAt: 'desc' },
                include: {
                    order: { select: { orderNumber: true } }
                }
            }),
            prisma.invoice.count({ where })
        ]);

        return createPaginatedResult(invoices, total, page, limit);
    }

    /**
     * Get GST report for a period
     */
    async getGSTReport(startDate: Date, endDate: Date): Promise<unknown> {
        const invoices = await prisma.invoice.findMany({
            where: {
                invoiceType: InvoiceType.TAX_INVOICE,
                issuedAt: { gte: startDate, lte: endDate }
            },
            orderBy: { issuedAt: 'asc' }
        });

        const summary = invoices.reduce((acc, inv) => ({
            totalSales: acc.totalSales + inv.subtotal.toNumber(),
            totalCGST: acc.totalCGST + inv.cgst.toNumber(),
            totalSGST: acc.totalSGST + inv.sgst.toNumber(),
            totalIGST: acc.totalIGST + inv.igst.toNumber(),
            totalTax: acc.totalTax + inv.totalTax.toNumber(),
            invoiceCount: acc.invoiceCount + 1,
        }), {
            totalSales: 0,
            totalCGST: 0,
            totalSGST: 0,
            totalIGST: 0,
            totalTax: 0,
            invoiceCount: 0,
        });

        return {
            period: { startDate, endDate },
            summary,
            invoices: invoices.map(inv => ({
                invoiceNumber: inv.invoiceNumber,
                date: inv.issuedAt,
                buyerName: inv.buyerName,
                buyerGstin: inv.buyerGstin,
                subtotal: inv.subtotal,
                cgst: inv.cgst,
                sgst: inv.sgst,
                igst: inv.igst,
                total: inv.totalAmount,
            }))
        };
    }
}

export const invoiceService = new InvoiceService();
