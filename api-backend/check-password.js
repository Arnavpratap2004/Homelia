const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@homelia.in' } });
  console.log('User found:', !!user);
  console.log('Hash stored:', user.passwordHash);
  console.log('Match with Admin@123:', bcrypt.compareSync('Admin@123', user.passwordHash));
  await prisma.$disconnect();
}
check();
