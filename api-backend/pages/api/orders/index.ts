l̥l̥import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';
import { getPaginationParams, createPaginatedResult, getPriceForRole, generateOrderNumber } from '../../../lib/helpers';
import { calculateGST, calculateItemTax, DEFAULT_GST_RATE, getStateCodeFromGSTIN, roundToTwo } from '../../../lib/gst';
import { Prisma } from '@prisma/client';

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
  shippingAddress: z.record(z.unknown()),
  billingAddress: z.record(z.unknown()),
  notes: z.string().optional(),
  quoteId: z.string().uuid().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'INVOICED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED']).optional(),
});

const SELLER_STATE_CODE = process.env.SELLER_STATE_CODE || '27';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

      const { page = 1, limit = 10, ...filters } = parsed.data;
      const { skip, take } = getPaginationParams({ page, limit });
      const isAdmin = req.user!.role === 'ADMIN';
      const where: Prisma.OrderWhereInput = {};
      if (!isAdmin) where.userId = req.user!.userId;
      if (filters.status) where.status = filters.status;
      if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where, skip, take, orderBy: { createdAt: 'desc' },
          select: {
            id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true, shippingAddress: true,
            user: { select: { name: true, email: true, companyName: true } },
            items: { select: { quantity: true, unitPrice: true, product: { select: { name: true } } } },
          },
        }),
        prisma.order.count({ where }),
      ]);
      return res.json({ success: true, ...createPaginatedResult(orders, total, page, limit) });
    }

    if (req.method === 'POST') {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      const input = parsed.data;

      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { gstNumber: true, stateCode: true } });
      const buyerStateCode = user?.stateCode || getStateCodeFromGSTIN(user?.gstNumber || '') || (input.billingAddress as any)?.stateCode || '27';

      const productIds = input.items.map(i => i.productId);
      const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
      if (products.length !== productIds.length) throw ApiError.badRequest('One or more products not found');

      let subtotal = 0;
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of input.items) {
        const product = products.find(p => p.id === item.productId)!;
        const unitPrice = getPriceForRole(req.user!.role, product.price?.toNumber() || null, product.b2bPrice?.toNumber() || null, product.dealerPrice?.toNumber() || null);
        if (!unitPrice && !product.isPriceOnRequest) throw ApiError.badRequest(`Price not available for ${product.name}`);
        if (product.isPriceOnRequest) throw ApiError.badRequest(`${product.name} requires a quote. Please submit an RFQ.`);
        if (item.quantity < product.moq) throw ApiError.badRequest(`Minimum order quantity for ${product.name} is ${product.moq}`);
        if (product.stockQuantity < item.quantity) throw ApiError.badRequest(`Insufficient stock for ${product.name}`);

        const { subtotal: itemSub, taxAmount, totalPrice } = calculateItemTax(item.quantity, unitPrice!, product.gstRate?.toNumber() || DEFAULT_GST_RATE);
        subtotal += itemSub;
        orderItems.push({
          product: { connect: { id: product.id } },
          quantity: item.quantity, unitPrice: unitPrice!,
          taxRate: product.gstRate || DEFAULT_GST_RATE, taxAmount, totalPrice,
        });
      }

      const gst = calculateGST(subtotal, SELLER_STATE_CODE, buyerStateCode);
      const totalSheets = input.items.reduce((s, i) => s + i.quantity, 0);
      const freightCharges = roundToTwo(Math.max(500, totalSheets * 50));
      const totalAmount = roundToTwo(gst.totalAmount + freightCharges);
      const orderNumber = await generateOrderNumber();

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber, userId: req.user!.userId,
            orderType: input.quoteId ? 'RFQ' : 'DIRECT', status: 'PENDING',
            subtotal, cgst: gst.cgst, sgst: gst.sgst, igst: gst.igst,
            totalTax: gst.totalTax, freightCharges, totalAmount, balanceDue: totalAmount,
            shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
            billingAddress: input.billingAddress as Prisma.InputJsonValue,
            notes: input.notes, quoteId: input.quoteId,
            items: { create: orderItems },
          },
          include: { items: { include: { product: true } } },
        });
        for (const item of input.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } });
        }
        return newOrder;
      });

      // Notify admin
      await prisma.notification.create({
        data: {
          type: 'NEW_ORDER', title: 'New Order Received',
          message: `Order ${order.orderNumber} placed for ₹${order.totalAmount.toNumber().toLocaleString('en-IN')}`,
          data: { orderNumber: order.orderNumber, amount: order.totalAmount.toNumber() },
          recipientRole: 'ADMIN',
        },
      });

      return res.status(201).json({ success: true, message: 'Order created successfully', data: order });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAuth(handler);
