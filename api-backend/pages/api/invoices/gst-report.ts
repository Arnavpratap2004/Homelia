import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware';
import { handleApiError } from '../../../lib/errors';

const gstReportSchema = z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, message: 'Method not allowed' }); }
  try {
    const parsed = gstReportSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const { startDate, endDate } = parsed.data;
    const invoices = await prisma.invoice.findMany({ where: { invoiceType: 'TAX_INVOICE', issuedAt: { gte: startDate, lte: endDate } }, orderBy: { issuedAt: 'asc' } });
    const summary = invoices.reduce((acc, inv) => ({
      totalSales: acc.totalSales + inv.subtotal.toNumber(), totalCGST: acc.totalCGST + inv.cgst.toNumber(),
      totalSGST: acc.totalSGST + inv.sgst.toNumber(), totalIGST: acc.totalIGST + inv.igst.toNumber(),
      totalTax: acc.totalTax + inv.totalTax.toNumber(), invoiceCount: acc.invoiceCount + 1,
    }), { totalSales: 0, totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0, invoiceCount: 0 });
    res.json({
      success: true, data: {
        period: { startDate, endDate }, summary,
        invoices: invoices.map(inv => ({ invoiceNumber: inv.invoiceNumber, date: inv.issuedAt, buyerName: inv.buyerName, buyerGstin: inv.buyerGstin, subtotal: inv.subtotal, cgst: inv.cgst, sgst: inv.sgst, igst: inv.igst, total: inv.totalAmount })),
      },
    });
  } catch (err) { handleApiError(err, res); }
}
export default withAdmin(handler);
