
import { PrismaClient, OrderStatus, QuoteStatus, Brand, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Full Data Seeding...');

    // 1. Fetch Users
    const dealer = await prisma.user.findFirst({ where: { role: 'DEALER' } });
    const b2b = await prisma.user.findFirst({ where: { role: 'B2B_CUSTOMER' } });

    if (!dealer || !b2b) {
        console.error('❌ Missing Dealer or B2B user. Run prisma/seed.ts first.');
        return;
    }

    // 2. Fetch Products
    const products = await prisma.product.findMany({ take: 5 });
    if (products.length === 0) {
        console.error('❌ Missing products. Run prisma/seed.ts first.');
        return;
    }

    // Cache products for easy access
    const p1 = products[0];
    const p2 = products[1];
    const p3 = products[2];

    // Helper for Decimals
    const d = (val: number) => new Prisma.Decimal(val);
    const price = (prod: any) => Number(prod.price);

    // 3. Create Orders
    console.log('📦 Creating Orders...');

    // Order 1: Pending (B2B)
    // Items: 10 * p1, 5 * p2
    const item1_price = price(p1);
    const item2_price = price(p2);
    const item1_total = 10 * item1_price;
    const item2_total = 5 * item2_price;
    const subtotal1 = item1_total + item2_total;
    const tax1 = subtotal1 * 0.18;
    const total1 = subtotal1 + tax1;

    await prisma.order.create({
        data: {
            orderNumber: `ORD-${Date.now()}-1`,
            userId: b2b.id,
            status: OrderStatus.PENDING,
            subtotal: d(subtotal1),
            totalTax: d(tax1),
            totalAmount: d(total1),
            shippingAddress: {
                street: "123 Business Park",
                city: "Pune",
                state: "Maharashtra",
                pincode: "411057"
            },
            billingAddress: { street: "Same", city: "Pune", state: "MH", pincode: "411057" },
            items: {
                create: [
                    {
                        productId: p1.id,
                        quantity: 10,
                        unitPrice: d(item1_price),
                        taxRate: d(18),
                        taxAmount: d(item1_total * 0.18),
                        totalPrice: d(item1_total * 1.18)
                    },
                    {
                        productId: p2.id,
                        quantity: 5,
                        unitPrice: d(item2_price),
                        taxRate: d(18),
                        taxAmount: d(item2_total * 0.18),
                        totalPrice: d(item2_total * 1.18)
                    }
                ]
            }
        }
    });

    // Order 2: Confirmed (Dealer)
    const item3_price = Number(p3.dealerPrice || p3.price);
    const item3_total = 50 * item3_price;
    const tax2 = item3_total * 0.18;

    await prisma.order.create({
        data: {
            orderNumber: `ORD-${Date.now()}-2`,
            userId: dealer.id,
            status: OrderStatus.CONFIRMED,
            subtotal: d(item3_total),
            totalTax: d(tax2),
            totalAmount: d(item3_total + tax2),
            shippingAddress: { street: "Dealer Shop 5", city: "Mumbai", state: "MH", pincode: "400001" },
            billingAddress: { street: "Dealer Shop 5", city: "Mumbai", state: "MH", pincode: "400001" },
            items: {
                create: [
                    {
                        productId: p3.id,
                        quantity: 50,
                        unitPrice: d(item3_price),
                        taxRate: d(18),
                        taxAmount: d(tax2),
                        totalPrice: d(item3_total + tax2)
                    }
                ]
            }
        }
    });

    // 4. Create Quotes
    console.log('📜 Creating Quotes...');

    // Quote 1: Requested
    await prisma.quote.create({
        data: {
            quoteNumber: `RFQ-${Date.now()}`,
            userId: dealer.id,
            status: QuoteStatus.REQUESTED, // Correct Enum
            notes: "Bulk requirement for new project.",
            items: {
                create: [
                    {
                        productId: p2.id,
                        requestedQty: 200,
                        notes: "Urgent"
                    }
                ]
            }
        }
    });

    console.log('✅ Full Data Seeding Completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
