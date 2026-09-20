const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@projectflow.dev' },
    update: {},
    create: {
      name: 'ProjectFlow Admin',
      email: 'admin@projectflow.dev',
      passwordHash,
      role: Role.ADMIN
    }
  });
  console.log('Seeded admin@projectflow.dev / Admin@123');
}
main().finally(()=>prisma.$disconnect());
