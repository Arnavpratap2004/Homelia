
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStock() {
    try {
        const product = await prisma.product.findFirst({
            where: { name: { contains: 'Nordic Oak Natural' } }
        });

        if (product) {
            console.log(`Product: ${product.name}`);
            console.log(`ID: ${product.id}`);
            console.log(`Current Stock: ${product.stockQuantity}`);
        } else {
            console.log('Product not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkStock();
