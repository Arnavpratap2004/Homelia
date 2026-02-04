
import { invoiceService } from '../services/invoice.service.js';
import { prisma } from '../config/database.js';

async function testGenerateInvoice() {
    try {
        // Get the last order
        const order = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });

        if (!order) {
            console.log('No order found to test.');
            return;
        }

        console.log(`Attempting to generate invoice for order: ${order.orderNumber} (${order.id})`);
        console.log(`User: ${order.user.email}`);

        const invoice = await invoiceService.generateTaxInvoice(order.id);
        console.log('Invoice generated successfully:', invoice);

    } catch (error) {
        console.error('FAILED to generate invoice:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testGenerateInvoice();
