import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists. Skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      fullName: 'System Administrator',
      role: 'ADMINISTRATOR',
      availabilityStatus: 'ONLINE',
    },
  });

  console.log('✅ Admin user seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
