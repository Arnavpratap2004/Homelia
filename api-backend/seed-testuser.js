
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@homelia.studio';
  const password = 'TestUser123!';

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Automated Test User',
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        phone: '1234567890'
      }
    });
    console.log('✅ Created test user:', user.email);
  } else {
    console.log('Test user already exists. Regenerating password just in case...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: 'ADMIN', status: 'ACTIVE' }
    });
    console.log('✅ Updated test user password:', email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
