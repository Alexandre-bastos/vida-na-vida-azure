import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  // Find Alexandre
  const user = await prisma.user.findFirst({
    where: {
      name: {
        contains: 'Alexandre'
      }
    },
    select: { id: true, name: true, role: true }
  });
  if (!user) {
    console.log('User Alexandre not found');
    return;
  }
  console.log(`User: ${user.name} (${user.id}) - Role: ${user.role}`);

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
  console.log(`Cell: ${cell.name} (${cell.id})`);

  // Check if Alexandre is leader
  const isLeader = await prisma.cell.count({ where: { id: cell.id, leaderId: user.id } }) > 0;
  console.log(`Is Alexandre leader? ${isLeader}`);

  // Check if Alexandre has membership
  const hasMembership = await prisma.cellMembership.count({ where: { cellId: cell.id, userId: user.id } }) > 0;
  console.log(`Does Alexandre have membership? ${hasMembership}`);

  // List Alexandre's memberships and leaderships for clarity
  const memberships = await prisma.cellMembership.findMany({
    where: { userId: user.id },
    include: { cell: { select: { id: true, name: true } } }
  });
  console.log(`Alexandre's memberships:`);
  for (const m of memberships) {
    console.log(`  - ${m.cell.name} (${m.cell.id})`);
  }

  const ledCells = await prisma.cell.findMany({
    where: { leaderId: user.id },
    select: { id: true, name: true }
  });
  console.log(`Alexandre's led cells:`);
  for (const c of ledCells) {
    console.log(`  - ${c.name} (${c.id})`);
  }
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});