import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError, ApiError } from '../../../../lib/errors';
import { calculateGST, roundToTwo } from '../../../../lib/gst';

const SELLER_STATE_CODE = process.env.SELLER_STATE_CODE || '27';

const pricingSchema = z.object({
  items: z.array(z.object({ quoteItemId: z.string().uuid(), quotedQty: z.number().int().min(1), quotedPrice: z.number().min(0) })),
  freightCharges: z.number().optional(),
  discount: z.number().optional(),
  validUntil: z.coerce.date(),
  adminNotes: z.string().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const id = req.query.id as string;
    const parsed = pricingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const pricing = parsed.data;

    const quote = await prisma.quote.findUnique({
      where: { id }, include: { items: true, user: { select: { stateCode: true, gstNumber: true } } },
    });
    if (!quote) throw ApiError.notFound('Quote not found');

    let subtotal = 0;
    const itemUpdates: { id: string; quotedQty: number; quotedPrice: number }[] = [];
    for (const pi of pricing.items) {
      const qi = quote.items.find((i: any) => i.id === pi.quoteItemId);
      if (!qi) throw ApiError.badRequest(`Quote item ${pi.quoteItemId} not found`);
      subtotal += pi.quotedPrice * pi.quotedQty;
      itemUpdates.push({ id: pi.quoteItemId, quotedQty: pi.quotedQty, quotedPrice: pi.quotedPrice });
    }

    const buyerStateCode = quote.user.stateCode || '27';
    const gst = calculateGST(subtotal, SELLER_STATE_CODE, buyerStateCode);
    const freightCharges = pricing.freightCharges || 0;
    const discount = pricing.discount || 0;
    const totalAmount = roundToTwo(gst.totalAmount + freightCharges - discount);

    const updatedQuote = await prisma.$transaction(async (tx) => {
      for (const item of itemUpdates) {
        await tx.quoteItem.update({ where: { id: item.id }, data: { quotedQty: item.quotedQty, quotedPrice: item.quotedPrice } });
      }
      return tx.quote.update({
        where: { id },
        data: { status: 'QUOTED', subtotal, totalTax: gst.totalTax, freightCharges, discount, totalAmount, validUntil: pricing.validUntil, adminNotes: pricing.adminNotes },
        include: { items: { include: { product: true } } },
      });
    });

    await prisma.notification.create({
      data: { type: 'QUOTE_STATUS_UPDATE', title: 'Quote Update', message: `Your quote is ready for review: ${quote.quoteNumber}`, data: { quoteNumber: quote.quoteNumber, status: 'QUOTED' }, recipientId: quote.userId },
    });

    res.json({ success: true, message: 'Quote pricing updated', data: updatedQuote });
  } catch (err) {
    handleApiError(err, res);
  }
}

export default withAdmin(handler);
