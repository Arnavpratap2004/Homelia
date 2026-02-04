
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInvoices() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'b2b@example.com' },
        });

        if (!user) {
            console.log('User b2b@example.com not found');
            return;
        }

        console.log('User ID:', user.id);

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: { invoices: true }
        });

        console.log(`Found ${orders.length} orders for user.`);

        for (const order of orders) {
            console.log(`Order ${order.orderNumber} (ID: ${order.id}):`);
            if (order.invoices.length === 0) {
                console.log('  - No invoices');
            } else {
                for (const inv of order.invoices) {
                    console.log(`  - Invoice: ${inv.invoiceNumber} (Type: ${inv.invoiceType})`);
                }
            }
        }

        const allInvoices = await prisma.invoice.findMany();
        console.log(`Total Invoices in DB: ${allInvoices.length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkInvoices();
