import { prisma } from '../config/database.js';
import { OrderStatus, OrderType, PaymentStatus, Prisma, Role } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';
import { generateOrderNumber, getPaginationParams, createPaginatedResult, PaginatedResult } from '../utils/helpers.js';
import { calculateGST, calculateItemTax, DEFAULT_GST_RATE, getStateCodeFromGSTIN, roundToTwo } from '../utils/gst.js';
import { env } from '../config/env.js';
import { notificationService } from './notification.service.js';
import { getPriceForRole } from '../middleware/roles.js';
import { invoiceService } from './invoice.service.js';

interface OrderItemInput {
    productId: string;
    quantity: number;
}

interface CreateOrderInput {
    items: OrderItemInput[];
    shippingAddress: Record<string, unknown>;
    billingAddress: Record<string, unknown>;
    notes?: string;
    quoteId?: string;
}

interface OrderListParams {
    userId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
}

class OrderService {
    /**
     * Create a new order
     */
    async create(userId: string, userRole: Role, input: CreateOrderInput): Promise<unknown> {
        // Get user for state code
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { gstNumber: true, stateCode: true }
        });

        // Get buyer state code from GSTIN or address
        const buyerStateCode = user?.stateCode ||
            getStateCodeFromGSTIN(user?.gstNumber || '') ||
            (input.billingAddress as { stateCode?: string })?.stateCode ||
            '27'; // Default to Maharashtra

        // Fetch products and validate
        const productIds = input.items.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true }
        });

        if (products.length !== productIds.length) {
            throw ApiError.badRequest('One or more products not found');
        }

        // Build order items with pricing
        let subtotal = 0;
        const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const item of input.items) {
            const product = products.find(p => p.id === item.productId)!;

            // Get price based on user role
            const unitPrice = getPriceForRole(
                userRole,
                product.price?.toNumber() || null,
                product.b2bPrice?.toNumber() || null,
                product.dealerPrice?.toNumber() || null
            );

            if (!unitPrice && !product.isPriceOnRequest) {
                throw ApiError.badRequest(`Price not available for ${product.name}`);
            }

            if (product.isPriceOnRequest) {
                throw ApiError.badRequest(`${product.name} requires a quote. Please submit an RFQ.`);
            }

            // Validate MOQ
            if (item.quantity < product.moq) {
                throw ApiError.badRequest(`Minimum order quantity for ${product.name} is ${product.moq}`);
            }

            // Check stock
            if (product.stockQuantity < item.quantity) {
                throw ApiError.badRequest(`Insufficient stock for ${product.name}`);
            }

            const { subtotal: itemSubtotal, taxAmount, totalPrice } = calculateItemTax(
                item.quantity,
                unitPrice!,
                product.gstRate?.toNumber() || DEFAULT_GST_RATE
            );

            subtotal += itemSubtotal;

            orderItems.push({
                product: { connect: { id: product.id } },
                quantity: item.quantity,
                unitPrice: unitPrice!,
                taxRate: product.gstRate || DEFAULT_GST_RATE,
                taxAmount,
                totalPrice,
            });
        }

        // Calculate GST
        const gst = calculateGST(subtotal, env.sellerStateCode, buyerStateCode);

        // Calculate freight (example: ₹50 per sheet, min ₹500)
        const totalSheets = input.items.reduce((sum, i) => sum + i.quantity, 0);
        const freightCharges = roundToTwo(Math.max(500, totalSheets * 50));

        const totalAmount = roundToTwo(gst.totalAmount + freightCharges);

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    orderType: input.quoteId ? OrderType.RFQ : OrderType.DIRECT,
                    status: OrderStatus.PENDING,
                    subtotal,
                    cgst: gst.cgst,
                    sgst: gst.sgst,
                    igst: gst.igst,
                    totalTax: gst.totalTax,
                    freightCharges,
                    totalAmount,
                    balanceDue: totalAmount,
                    shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
                    billingAddress: input.billingAddress as Prisma.InputJsonValue,
                    notes: input.notes,
                    quoteId: input.quoteId,
                    items: {
                        create: orderItems
                    }
                },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });

            // Update stock
            for (const item of input.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stockQuantity: { decrement: item.quantity } }
                });
            }

            return newOrder;
        });

        // Notify admin
        await notificationService.notifyNewOrder({
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount.toNumber(),
            userId
        });

        // Generate Invoice Automatically
        try {
            await invoiceService.generateTaxInvoice(order.id);
        } catch (error) {
            console.error('Failed to generate automatic invoice for order:', order.orderNumber, error);
            // We don't throw here to avoid failing the order response
        }

        return order;
    }

    /**
     * Get orders with filters
     */
    async list(params: OrderListParams): Promise<PaginatedResult<unknown>> {
        const { page = 1, limit = 20, ...filters } = params;
        const { skip, take } = getPaginationParams({ page, limit });

        const where: Prisma.OrderWhereInput = {};
        if (filters.userId) where.userId = filters.userId;
        if (filters.status) where.status = filters.status;
        if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    totalAmount: true,
                    createdAt: true,
                    shippingAddress: true,
                    user: { select: { name: true, email: true, companyName: true } },
                    items: {
                        select: {
                            quantity: true,
                            unitPrice: true,
                            product: { select: { name: true } }
                        }
                    },
                }
            }),
            prisma.order.count({ where })
        ]);

        return createPaginatedResult(orders, total, page, limit);
    }

    /**
     * Get order by ID
     */
    async getById(orderId: string, userId?: string): Promise<unknown> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { name: true, email: true, phone: true, companyName: true, gstNumber: true } },
                items: { include: { product: true } },
                invoices: true,
                payments: true,
                shipments: true,
            }
        });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        // If userId provided, verify ownership
        if (userId && order.userId !== userId) {
            throw ApiError.forbidden('Access denied');
        }

        return order;
    }

    /**
     * Update order status (Admin)
     */
    async updateStatus(orderId: string, status: OrderStatus, adminNotes?: string): Promise<unknown> {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status, adminNotes },
            include: { user: true }
        });

        // Notify user
        await notificationService.notifyOrderStatusUpdate(order.userId, {
            orderNumber: order.orderNumber,
            status
        });

        return order;
    }

    /**
     * Cancel order
     */
    async cancel(orderId: string, userId: string, isAdmin: boolean): Promise<void> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        if (!isAdmin && order.userId !== userId) {
            throw ApiError.forbidden('Access denied');
        }

        // Can only cancel pending orders
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw ApiError.badRequest('Cannot cancel order in current status');
        }

        // Restore stock
        await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stockQuantity: { increment: item.quantity } }
                });
            }

            await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.CANCELLED }
            });
        });
    }

    /**
     * Get user's orders
     */
    async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<unknown>> {
        return this.list({ userId, page, limit });
    }
}

export const orderService = new OrderService();
