import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError, ApiError } from '../../../../lib/errors';
import { generateInvoiceNumber, generateOrderNumber } from '../../../../lib/helpers';
import { getFinancialYear } from '../../../../lib/gst';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const quoteId = req.query.quoteId as string;
    const quote = await prisma.quote.findUnique({ where: { id: quoteId }, include: { user: true, items: { include: { product: true } }, order: true } });
    if (!quote) throw ApiError.notFound('Quote not found');
    if (!quote.totalAmount) throw ApiError.badRequest('Quote has not been priced yet');

    let orderId = quote.order?.id;
    if (!orderId) {
      const orderNumber = await generateOrderNumber();
      const newOrder = await prisma.order.create({
        data: { orderNumber, userId: quote.userId, quoteId: quote.id, status: 'PENDING', subtotal: quote.subtotal || 0, totalTax: quote.totalTax || 0, freightCharges: quote.freightCharges || 0, discount: quote.discount || 0, totalAmount: quote.totalAmount, billingAddress: quote.user.billingAddress || {}, shippingAddress: quote.user.shippingAddress || quote.user.billingAddress || {}, cgst: 0, sgst: 0, igst: 0 },
      });
      orderId = newOrder.id;
    }

    const financialYear = getFinancialYear();
    const invoiceNumber = await generateInvoiceNumber(financialYear, 'PRO');
    const subtotal = quote.subtotal?.toNumber() || 0;
    const totalTax = quote.totalTax?.toNumber() || subtotal * 0.18;
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber, financialYear, invoiceType: 'PROFORMA', orderId,
        subtotal: quote.subtotal || 0, cgst: totalTax / 2, sgst: totalTax / 2, igst: 0,
        totalTax: quote.totalTax || 0, freightCharges: quote.freightCharges || 0, discount: quote.discount || 0, totalAmount: quote.totalAmount!,
        buyerName: quote.user.companyName || quote.user.name, buyerGstin: quote.user.gstNumber, buyerStateCode: quote.user.stateCode,
        buyerAddress: (quote.user.billingAddress || {}) as any,
        sellerGstin: process.env.SELLER_GSTIN || '', sellerStateCode: process.env.SELLER_STATE_CODE || '27',
        sellerAddress: { name: process.env.SELLER_NAME, address: process.env.SELLER_ADDRESS, phone: process.env.SELLER_PHONE, email: process.env.SELLER_EMAIL },
        dueDate: quote.validUntil,
      },
    });
    res.status(201).json({ success: true, message: 'Proforma invoice generated', data: invoice });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
