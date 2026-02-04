
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCounts() {
    try {
        const users = await prisma.user.count();
        const products = await prisma.product.count();
        const orders = await prisma.order.count();
        const quotes = await prisma.quote.count();
        const orderItems = await prisma.orderItem.count();

        console.log('--- Database Counts ---');
        console.log(`Users: ${users}`);
        console.log(`Products: ${products}`);
        console.log(`Orders: ${orders}`);
        console.log(`Quotes: ${quotes}`);
        console.log(`OrderItems: ${orderItems}`);
        console.log('-----------------------');
    } catch (e) {
        console.error('Error counting DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkCounts();
