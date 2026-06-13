const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@homelia.in';
  const password = 'Admin@123';

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Homelia Admin',
        role: 'ADMIN',
        phone: '+919876543210',
        isVerified: true,
        isActive: true,
      },
    });
    console.log('✅ Created admin user:', user.email);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'ADMIN', isActive: true, isVerified: true },
    });
    console.log('✅ Updated admin user:', email);
  }

  console.log('\n📧 Email:    admin@homelia.in');
  console.log('🔑 Password: Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
