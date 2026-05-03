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

  // Check if Alexandre is leader of any cell
  const ledCells = await prisma.cell.findMany({
    where: { leaderId: user.id },
    select: { id: true, name: true }
  });
  console.log(`Alexandre leads ${ledCells.length} cell(s):`);
  for (const c of ledCells) {
    console.log(`  - ${c.name} (${c.id})`);
  }

  // Check Alexandre's memberships
  const memberships = await prisma.cellMembership.findMany({
    where: { userId: user.id },
    include: { cell: { select: { id: true, name: true } } }
  });
  console.log(`Alexandre has ${memberships.length} membership(s):`);
  for (const m of memberships) {
    console.log(`  - Cell: ${m.cell?.name} (${m.cell?.id})`);
  }

  // Specifically check Next Pavuna
  const nextPavuna = await prisma.cell.findFirst({
    where: {
      name: {
        contains: 'Next Pavuna'
      }
    },
    select: { id: true, name: true }
  });
  if (nextPavuna) {
    console.log(`\nNext Pavuna cell: ${nextPavuna.name} (${nextPavuna.id})`);
    // Check if Alexandre is leader
    const isLeader = nextPavuna.id === ledCells.find(c => c.id === nextPavuna.id)?.id;
    console.log(`Is Alexandre leader? ${isLeader}`);
    // Check if Alexandre has membership
    const hasMembership = memberships.some(m => m.cellId === nextPavuna.id);
    console.log(`Does Alexandre have membership? ${hasMembership}`);
  } else {
    console.log('Next Pavuna cell not found');
  }
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});