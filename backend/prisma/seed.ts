import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);

    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash,
        fullName: 'System Administrator',
        role: 'ADMINISTRATOR',
        availabilityStatus: 'ONLINE',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ffdfbf',
      },
    });

    console.log('✅ Admin user seeded successfully.');
  } else {
    console.log('✅ Admin user already exists. Skipping seed.');
  }

  // Create a standard test user (Agent)
  const existingAgent = await prisma.user.findUnique({
    where: { email: 'agent@example.com' },
  });

  if (!existingAgent) {
    const agentPasswordHash = await bcrypt.hash('Agent@123', 12);
    await prisma.user.create({
      data: {
        email: 'agent@example.com',
        passwordHash: agentPasswordHash,
        fullName: 'Support Agent',
        role: 'SUPPORT_AGENT',
        availabilityStatus: 'ONLINE',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent&backgroundColor=b6e3f4',
      },
    });
    console.log('✅ Agent user seeded successfully.');
  } else {
    console.log('✅ Agent user already exists. Skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
