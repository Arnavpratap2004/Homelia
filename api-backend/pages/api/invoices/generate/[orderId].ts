import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../../lib/middleware';
import { handleApiError, ApiError } from '../../../../lib/errors';
import { generateInvoiceNumber } from '../../../../lib/helpers';
import { getFinancialYear } from '../../../../lib/gst';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const orderId = req.query.orderId as string;
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true, items: { include: { product: true } } } });
    if (!order) throw ApiError.notFound('Order not found');
    const existing = await prisma.invoice.findFirst({ where: { orderId, invoiceType: 'TAX_INVOICE' } });
    if (existing) throw ApiError.conflict('Tax invoice already exists for this order');

    const financialYear = getFinancialYear();
    const invoiceNumber = await generateInvoiceNumber(financialYear, 'INV');
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber, financialYear, invoiceType: 'TAX_INVOICE', orderId,
        subtotal: order.subtotal, cgst: order.cgst, sgst: order.sgst, igst: order.igst,
        totalTax: order.totalTax, freightCharges: order.freightCharges, discount: order.discount, totalAmount: order.totalAmount,
        buyerName: order.user.companyName || order.user.name, buyerGstin: order.user.gstNumber, buyerStateCode: order.user.stateCode,
        buyerAddress: order.billingAddress as object,
        sellerGstin: process.env.SELLER_GSTIN || '', sellerStateCode: process.env.SELLER_STATE_CODE || '27',
        sellerAddress: { name: process.env.SELLER_NAME, address: process.env.SELLER_ADDRESS, phone: process.env.SELLER_PHONE, email: process.env.SELLER_EMAIL },
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    });
    res.status(201).json({ success: true, message: 'Tax invoice generated', data: invoice });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
