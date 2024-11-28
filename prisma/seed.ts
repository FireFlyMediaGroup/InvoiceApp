import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const chris = await prisma.user.upsert({
    where: { email: 'chris.odom@skyspecs.com' },
    update: {},
    create: {
      email: 'chris.odom@skyspecs.com',
      firstName: 'Chris',
      lastName: 'Odom',
      isAllowed: true,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Smith',
      isAllowed: true,
    },
  });

  console.log({ chris, bob });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
