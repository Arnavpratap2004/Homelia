const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const dealerPassword = await bcrypt.hash('Dealer@123', 10);
  const b2bPassword = await bcrypt.hash('Client@123', 10);

  const users = [
    {
      email: 'dealer@homelia.in',
      passwordHash: dealerPassword,
      name: 'Test Dealer',
      role: 'DEALER',
      phone: '+919876543211',
      isVerified: true,
      isActive: true,
      companyName: 'Laminate Hub',
      gstNumber: '27AAAAA0000A1Z6'
    },
    {
      email: 'b2b@homelia.in',
      passwordHash: b2bPassword,
      name: 'Test B2B Client',
      role: 'B2B_CUSTOMER',
      phone: '+919876543212',
      isVerified: true,
      isActive: true,
      companyName: 'BuildRight Constructions'
    }
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!existingUser) {
      await prisma.user.create({ data: userData });
      console.log(`✅ Created ${userData.role} user:`, userData.email);
    } else {
      await prisma.user.update({
        where: { email: userData.email },
        data: userData
      });
      console.log(`✅ Updated ${userData.role} user:`, userData.email);
    }
  }

  console.log('\n--- Login Credentials ---');
  console.log('👷 Dealer Account');
  console.log('Email:    dealer@homelia.in');
  console.log('Password: Dealer@123');
  console.log('\n🏢 B2B Customer Account');
  console.log('Email:    b2b@homelia.in');
  console.log('Password: Client@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
