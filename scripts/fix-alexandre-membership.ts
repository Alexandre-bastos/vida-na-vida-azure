import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
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

  // Find cell Next Pavunna
  const cell = await prisma.cell.findFirst({
    where: {
      name: {
        contains: 'Next Pavunna'
      }
    },
    select: { id: true, name: true }
  });
  if (!cell) {
    console.log('Cell Next Pavunna not found');
    return;
  }
  console.log(`Found cell: ${cell.name} (${cell.id})`);

  // Delete memberships for this user and cell
  const result = await prisma.cellMembership.deleteMany({
    where: {
      userId: user.id,
      cellId: cell.id
    }
  });
  console.log(`Deleted ${result.count} membership(s) for user ${user.name} and cell ${cell.name}`);
}

fix().catch(e => {
  console.error(e);
  process.exit(1);
});