const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to connect to database...');
    const count = await prisma.product.count();
    console.log('Connection successful! Product count:', count);
    const featured = await prisma.product.findMany({ where: { isFeatured: true } });
    console.log('Featured products:', featured.length);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
