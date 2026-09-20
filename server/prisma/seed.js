const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@projectflow.dev').toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.SEED_ADMIN_NAME || 'ProjectFlow Admin';

  if (password.length < 8) throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters.');

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name, role: Role.ADMIN },
    create: { name, email, passwordHash, role: Role.ADMIN }
  });

  console.log(`Seeded admin account: ${email}`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
