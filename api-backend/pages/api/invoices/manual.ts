import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/errors';
import { generateInvoiceNumber } from '../../../lib/helpers';
import { getFinancialYear } from '../../../lib/gst';
import { Prisma } from '@prisma/client';

const manualInvoiceSchema = z.object({
  customer: z.object({ name: z.string().min(1), email: z.string().email(), phone: z.string().min(10), address: z.any(), gstin: z.string().optional() }),
  items: z.array(z.object({ productId: z.string().optional(), productName: z.string().min(1), quantity: z.number().positive(), unitPrice: z.number().min(0), taxRate: z.number().min(0) })).min(1),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const parsed = manualInvoiceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const data = parsed.data;

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new ApiError(500, 'No admin user found');

    let subtotal = 0, totalTax = 0;
    const orderItemsData = data.items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = itemTotal * (item.taxRate / 100);
      subtotal += itemTotal;
      totalTax += itemTax;
      return { quantity: item.quantity, unitPrice: new Prisma.Decimal(item.unitPrice), taxRate: new Prisma.Decimal(item.taxRate), taxAmount: new Prisma.Decimal(itemTax), totalPrice: new Prisma.Decimal(itemTotal + itemTax) };
    });
    const totalAmount = subtotal + totalTax;

    let miscProduct = await prisma.product.findFirst({ where: { productCode: 'MISC-001' } });
    if (!miscProduct) {
      miscProduct = await prisma.product.create({ data: { name: 'Miscellaneous Item', productCode: 'MISC-001', description: 'Custom/Manual invoice item', brand: 'DURIAN', category: 'DECORATIVE', finish: 'MATTE', texture: 'Solid', thickness: '1mm', sheetSize: '8x4', applications: ['furniture'], isPriceOnRequest: true, stockQuantity: 999999, isActive: true } });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: `MAN-ORD-${Date.now()}`, userId: adminUser.id, status: 'INVOICED',
        subtotal: new Prisma.Decimal(subtotal), totalTax: new Prisma.Decimal(totalTax), totalAmount: new Prisma.Decimal(totalAmount),
        billingAddress: { ...data.customer.address, name: data.customer.name, email: data.customer.email, phone: data.customer.phone, gstin: data.customer.gstin },
        shippingAddress: data.customer.address,
        items: { create: orderItemsData.map(i => ({ productId: miscProduct!.id, ...i })) },
        cgst: new Prisma.Decimal(totalTax / 2), sgst: new Prisma.Decimal(totalTax / 2), igst: new Prisma.Decimal(0),
        notes: `Manual Invoice - Customer: ${data.customer.name}`,
      },
    });

    const financialYear = getFinancialYear();
    const invoiceNumber = await generateInvoiceNumber(financialYear, 'INV');
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber, financialYear, invoiceType: 'TAX_INVOICE', orderId: order.id,
        subtotal: new Prisma.Decimal(subtotal), cgst: new Prisma.Decimal(totalTax / 2), sgst: new Prisma.Decimal(totalTax / 2), igst: new Prisma.Decimal(0),
        totalTax: new Prisma.Decimal(totalTax), totalAmount: new Prisma.Decimal(totalAmount),
        buyerName: data.customer.name, buyerGstin: data.customer.gstin, buyerStateCode: '10',
        buyerAddress: { ...data.customer.address, email: data.customer.email, phone: data.customer.phone },
        sellerGstin: process.env.SELLER_GSTIN || '', sellerStateCode: process.env.SELLER_STATE_CODE || '27',
        sellerAddress: { name: process.env.SELLER_NAME, address: process.env.SELLER_ADDRESS, phone: process.env.SELLER_PHONE, email: process.env.SELLER_EMAIL },
        dueDate: new Date(),
      },
    });
    res.status(201).json({ success: true, message: 'Manual invoice created', data: invoice });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
