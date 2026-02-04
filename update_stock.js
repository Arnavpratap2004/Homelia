
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndUpdateStock() {
    try {
        const productName = 'Urban Concrete Grey';
        console.log(`Searching for product: ${productName}`);

        const product = await prisma.product.findFirst({
            where: { name: productName }
        });

        if (!product) {
            console.log('Product not found!');
            return;
        }

        console.log(`Current stock for ${product.name} (${product.id}): ${product.stockQuantity}`);

        if (product.stockQuantity < 1000) {
            console.log('Updating stock to 5000...');
            const updated = await prisma.product.update({
                where: { id: product.id },
                data: { stockQuantity: 5000 }
            });
            console.log(`New stock: ${updated.stockQuantity}`);
        } else {
            console.log('Stock is already sufficient.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndUpdateStock();
