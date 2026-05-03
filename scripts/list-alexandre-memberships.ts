import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listMemberships() {
  // Find user Alexandre
  const user = await prisma.user.findFirst({
    where: {
      name: {
        contains: 'Alexandre'
      }
    },
    select: { id: true, name: true }
  });
  if (!user) {
    console.log('User Alexandre not found');
    return;
  }
  console.log(`Found user: ${user.name} (${user.id})`);

  // Find all memberships for this user
  const memberships = await prisma.cellMembership.findMany({
    where: { userId: user.id },
    include: { cell: true }
  });
  console.log(`Found ${memberships.length} membership(s):`);
  for (const m of memberships) {
    console.log(`  - Cell: ${m.cell?.name} (${m.cell?.id})`);
  }
}

listMemberships().catch(e => {
  console.error(e);
  process.exit(1);
});