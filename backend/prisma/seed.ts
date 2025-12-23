import { PrismaClient, Role, Brand, Category, Finish } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Hardcoded UUIDs to ensure consistency with frontend mock data
const PRODUCT_IDS = {
    // Durian
    'DUR-WG-001': '11111111-1111-4111-8111-111111111111',
    'DUR-WG-002': '11111111-1111-4111-8111-111111111112',
    'DUR-ST-001': '11111111-1111-4111-8111-111111111113',
    'DUR-HG-001': '11111111-1111-4111-8111-111111111114',
    'DUR-EX-001': '11111111-1111-4111-8111-111111111115',
    'DUR-CP-001': '11111111-1111-4111-8111-111111111116',

    // Rockstar
    'ROC-UC-001': '22222222-2222-4222-8222-222222222221',
    'ROC-SL-001': '22222222-2222-4222-8222-222222222222',
    'ROC-MT-001': '22222222-2222-4222-8222-222222222223',
    'ROC-WG-001': '22222222-2222-4222-8222-222222222224',
    'ROC-FB-001': '22222222-2222-4222-8222-222222222225',
    'ROC-FR-001': '22222222-2222-4222-8222-222222222226',
};

async function main() {
    console.log('🌱 Seeding database...');

    // Cleanup existing data
    console.log('🧹 Cleaning up existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.quoteItem.deleteMany();
    await prisma.quote.deleteMany();
    await prisma.product.deleteMany();
    // Don't delete users to preserve login sessions if possible, but for consistency using upsert below

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@homelia.in' },
        update: {},
        create: {
            email: 'admin@homelia.in',
            phone: '9876543210',
            passwordHash: adminPassword,
            name: 'Admin User',
            role: Role.ADMIN,
            isVerified: true,
            companyName: 'Homelia Laminates',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create sample dealer
    const dealerPassword = await bcrypt.hash('dealer123', 12);
    const dealer = await prisma.user.upsert({
        where: { email: 'dealer@example.com' },
        update: {},
        create: {
            email: 'dealer@example.com',
            phone: '9876543211',
            passwordHash: dealerPassword,
            name: 'Sample Dealer',
            role: Role.DEALER,
            companyName: 'ABC Interiors',
            gstNumber: '27AAAAA0000A1Z5',
            stateCode: '27',
        },
    });
    console.log('✅ Dealer user created:', dealer.email);

    // Create sample B2B customer
    const b2bPassword = await bcrypt.hash('b2b123', 12);
    const b2bCustomer = await prisma.user.upsert({
        where: { email: 'b2b@example.com' },
        update: {},
        create: {
            email: 'b2b@example.com',
            phone: '9876543212',
            passwordHash: b2bPassword,
            name: 'B2B Customer',
            role: Role.B2B_CUSTOMER,
            companyName: 'XYZ Furniture',
            gstNumber: '29BBBBB0000B1Z5',
            stateCode: '29',
        },
    });
    console.log('✅ B2B customer created:', b2bCustomer.email);

    // Create Durian products
    const durianProducts = [
        {
            id: PRODUCT_IDS['DUR-WG-001'],
            name: 'American Walnut Classic',
            productCode: 'DUR-WG-001',
            brand: Brand.DURIAN,
            category: Category.DECORATIVE,
            collection: 'Endeavour',
            finish: Finish.MATTE,
            texture: 'Woodgrain',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['wardrobe', 'furniture', 'office'],
            price: 2450,
            dealerPrice: 2200,
            b2bPrice: 2350,
            moq: 10,
            stockQuantity: 100,
            description: 'Premium American Walnut pattern with rich, warm tones.',
            isFeatured: true,
            isBestseller: true,
        },
        {
            id: PRODUCT_IDS['DUR-WG-002'],
            name: 'Nordic Oak Natural',
            productCode: 'DUR-WG-002',
            brand: Brand.DURIAN,
            category: Category.DECORATIVE,
            collection: 'Italia',
            finish: Finish.SUEDE,
            texture: 'Woodgrain',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['kitchen', 'wardrobe', 'furniture'],
            price: 2680,
            dealerPrice: 2400,
            b2bPrice: 2550,
            moq: 10,
            stockQuantity: 80,
            description: 'Light Nordic Oak finish with subtle grain patterns.',
            isFeatured: true,
        },
        {
            id: PRODUCT_IDS['DUR-ST-001'],
            name: 'Charcoal Slate',
            productCode: 'DUR-ST-001',
            brand: Brand.DURIAN,
            category: Category.DECORATIVE,
            collection: 'Romania',
            finish: Finish.TEXTURED,
            texture: 'Stone',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['wall-panels', 'office', 'furniture'],
            price: 2890,
            dealerPrice: 2600,
            b2bPrice: 2750,
            moq: 10,
            stockQuantity: 60,
            description: 'Deep charcoal slate texture with authentic stone-like finish.',
            isBestseller: true,
        },
        {
            id: PRODUCT_IDS['DUR-HG-001'],
            name: 'Pure White Gloss',
            productCode: 'DUR-HG-001',
            brand: Brand.DURIAN,
            category: Category.DECORATIVE,
            collection: 'Impressions',
            finish: Finish.HIGH_GLOSS,
            texture: 'Solid',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['kitchen', 'wardrobe', 'furniture'],
            price: 3200,
            dealerPrice: 2880,
            b2bPrice: 3050,
            moq: 10,
            stockQuantity: 75,
            description: 'Ultra-reflective pure white high gloss laminate.',
            isFeatured: true,
            isBestseller: true,
        },
        {
            id: PRODUCT_IDS['DUR-EX-001'],
            name: 'Exterior Teak',
            productCode: 'DUR-EX-001',
            brand: Brand.DURIAN,
            category: Category.EXTERIOR,
            collection: 'ECGL',
            finish: Finish.TEXTURED,
            texture: 'Woodgrain',
            thickness: '1.5mm',
            sheetSize: '8x4',
            applications: ['exterior', 'wall-panels'],
            isPriceOnRequest: true,
            moq: 25,
            stockQuantity: 40,
            description: 'Weather-resistant exterior grade laminate with teak wood finish.',
        },
        {
            id: PRODUCT_IDS['DUR-CP-001'],
            name: 'Compact White Core',
            productCode: 'DUR-CP-001',
            brand: Brand.DURIAN,
            category: Category.COMPACT,
            collection: 'Compact',
            finish: Finish.MATTE,
            texture: 'Solid',
            thickness: '6mm',
            sheetSize: '8x4',
            applications: ['wall-panels', 'furniture', 'office'],
            isPriceOnRequest: true,
            moq: 20,
            stockQuantity: 40,
            description: 'High-density compact laminate panel with solid white core.',
        },
    ];

    for (const product of durianProducts) {
        await prisma.product.upsert({
            where: { productCode: product.productCode },
            update: { ...product }, // Update all fields if exists to ensure IDs match
            create: product,
        });
    }
    console.log(`✅ Created ${durianProducts.length} Durian products`);

    // Create Rockstar products
    const rockstarProducts = [
        {
            id: PRODUCT_IDS['ROC-UC-001'],
            name: 'Urban Concrete Grey',
            productCode: 'ROC-UC-001',
            brand: Brand.ROCKSTAR,
            category: Category.DECORATIVE,
            collection: 'Urban Collection',
            finish: Finish.TEXTURED,
            texture: 'Concrete',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['wall-panels', 'office', 'furniture'],
            price: 2550,
            dealerPrice: 2300,
            b2bPrice: 2420,
            moq: 10,
            stockQuantity: 90,
            description: 'Industrial-chic concrete texture with subtle variations.',
            isFeatured: true,
            isBestseller: true,
        },
        {
            id: PRODUCT_IDS['ROC-SL-001'],
            name: 'Midnight Black Silk',
            productCode: 'ROC-SL-001',
            brand: Brand.ROCKSTAR,
            category: Category.DECORATIVE,
            collection: 'Urban Collection',
            finish: Finish.SILK,
            texture: 'Solid',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['kitchen', 'wardrobe', 'furniture'],
            price: 2780,
            dealerPrice: 2500,
            b2bPrice: 2650,
            moq: 10,
            stockQuantity: 70,
            description: 'Deep black laminate with silky smooth finish.',
            isFeatured: true,
        },
        {
            id: PRODUCT_IDS['ROC-MT-001'],
            name: 'Bronze Metallic',
            productCode: 'ROC-MT-001',
            brand: Brand.ROCKSTAR,
            category: Category.DECORATIVE,
            collection: 'Metallics',
            finish: Finish.METALLIC,
            texture: 'Metallic',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['wall-panels', 'furniture', 'doors'],
            price: 3100,
            dealerPrice: 2790,
            b2bPrice: 2950,
            moq: 10,
            stockQuantity: 45,
            description: 'Stunning bronze metallic finish with subtle shimmer.',
            isBestseller: true,
        },
        {
            id: PRODUCT_IDS['ROC-WG-001'],
            name: 'Tropical Teak',
            productCode: 'ROC-WG-001',
            brand: Brand.ROCKSTAR,
            category: Category.DECORATIVE,
            collection: 'Nature Series',
            finish: Finish.MATTE,
            texture: 'Woodgrain',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['wardrobe', 'furniture', 'office'],
            price: 2390,
            dealerPrice: 2150,
            b2bPrice: 2270,
            moq: 10,
            stockQuantity: 110,
            description: 'Rich tropical teak woodgrain with warm golden undertones.',
        },
        {
            id: PRODUCT_IDS['ROC-FB-001'],
            name: 'Linen Fabric',
            productCode: 'ROC-FB-001',
            brand: Brand.ROCKSTAR,
            category: Category.DECORATIVE,
            collection: 'Fabric Textures',
            finish: Finish.TEXTURED,
            texture: 'Fabric',
            thickness: '1mm',
            sheetSize: '8x4',
            applications: ['wall-panels', 'furniture', 'wardrobe'],
            price: 2650,
            dealerPrice: 2380,
            b2bPrice: 2520,
            moq: 10,
            stockQuantity: 55,
            description: 'Elegant linen fabric texture in neutral beige.',
            isFeatured: true,
        },
        {
            id: PRODUCT_IDS['ROC-FR-001'],
            name: 'Fire Shield FR',
            productCode: 'ROC-FR-001',
            brand: Brand.ROCKSTAR,
            category: Category.FIRE_RETARDANT,
            collection: 'Fire Shield',
            finish: Finish.MATTE,
            texture: 'Solid',
            thickness: '1.25mm',
            sheetSize: '8x4',
            applications: ['office', 'wall-panels'],
            isPriceOnRequest: true,
            moq: 20,
            stockQuantity: 50,
            description: 'Fire-retardant laminate meeting Class 1 fire rating.',
        },
    ];

    for (const product of rockstarProducts) {
        await prisma.product.upsert({
            where: { productCode: product.productCode },
            update: { ...product }, // Update all fields if exists
            create: product,
        });
    }
    console.log(`✅ Created ${rockstarProducts.length} Rockstar products`);

    // Create initial sequences
    const currentYear = new Date().getFullYear();
    await prisma.orderSequence.upsert({
        where: { year: currentYear },
        update: {},
        create: { year: currentYear, lastNumber: 0, prefix: 'ORD' },
    });
    await prisma.quoteSequence.upsert({
        where: { year: currentYear },
        update: {},
        create: { year: currentYear, lastNumber: 0, prefix: 'RFQ' },
    });
    await prisma.sampleSequence.upsert({
        where: { year: currentYear },
        update: {},
        create: { year: currentYear, lastNumber: 0, prefix: 'SMP' },
    });
    console.log('✅ Sequences initialized');

    console.log('\n🎉 Database seeding completed with UUIDs!');
    console.log('\nTest Credentials:');
    console.log('  Admin:  admin@homelia.in / admin123');
    console.log('  Dealer: dealer@example.com / dealer123');
    console.log('  B2B:    b2b@example.com / b2b123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
