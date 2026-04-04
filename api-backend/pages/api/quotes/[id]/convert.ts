import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError, ApiError } from '../../../../lib/errors';

const convertSchema = z.object({ shippingAddress: z.record(z.unknown()), billingAddress: z.record(z.unknown()) });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const id = req.query.id as string;
    const parsed = convertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const quote = await prisma.quote.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
    if (!quote) throw ApiError.notFound('Quote not found');
    if (quote.userId !== req.user!.userId) throw ApiError.forbidden('Access denied');
    if (quote.status !== 'APPROVED') throw ApiError.badRequest('Quote must be approved before conversion');
    if (quote.validUntil && quote.validUntil < new Date()) throw ApiError.badRequest('Quote has expired');

    // Build order items from quoted prices - simplified version (direct create)
    const { generateOrderNumber, getPriceForRole } = await import('../../../../lib/helpers');
    const { calculateGST, calculateItemTax, DEFAULT_GST_RATE, getStateCodeFromGSTIN, roundToTwo } = await import('../../../../lib/gst');

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { gstNumber: true, stateCode: true } });
    const buyerStateCode = user?.stateCode || getStateCodeFromGSTIN(user?.gstNumber || '') || '27';
    const SELLER_STATE_CODE = process.env.SELLER_STATE_CODE || '27';

    let subtotal = 0;
    const orderItemsData = quote.items.map(item => {
      const qty = item.quotedQty || item.requestedQty;
      const price = item.quotedPrice?.toNumber() || getPriceForRole('B2B_CUSTOMER', item.product.price?.toNumber() || null, item.product.b2bPrice?.toNumber() || null, item.product.dealerPrice?.toNumber() || null) || 0;
      const { subtotal: itemSub, taxAmount, totalPrice } = calculateItemTax(qty, price, item.product.gstRate?.toNumber() || DEFAULT_GST_RATE);
      subtotal += itemSub;
      return { productId: item.productId, quantity: qty, unitPrice: price, taxRate: item.product.gstRate || DEFAULT_GST_RATE, taxAmount, totalPrice };
    });

    const gst = calculateGST(subtotal, SELLER_STATE_CODE, buyerStateCode);
    const totalSheets = orderItemsData.reduce((s, i) => s + i.quantity, 0);
    const freightCharges = roundToTwo(Math.max(500, totalSheets * 50));
    const totalAmount = roundToTwo(gst.totalAmount + freightCharges);
    const orderNumber = await generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber, userId: req.user!.userId, orderType: 'RFQ', status: 'PENDING',
          subtotal, cgst: gst.cgst, sgst: gst.sgst, igst: gst.igst, totalTax: gst.totalTax,
          freightCharges, totalAmount, balanceDue: totalAmount, quoteId: id,
          shippingAddress: parsed.data.shippingAddress as any, billingAddress: parsed.data.billingAddress as any,
          items: { create: orderItemsData.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate, taxAmount: i.taxAmount, totalPrice: i.totalPrice })) },
        },
        include: { items: { include: { product: true } } },
      });
      await tx.quote.update({ where: { id }, data: { status: 'CONVERTED' } });
      return newOrder;
    });

    res.status(201).json({ success: true, message: 'Quote converted to order', data: order });
  } catch (err) { handleApiError(err, res); }
}
export default withAuth(handler);
