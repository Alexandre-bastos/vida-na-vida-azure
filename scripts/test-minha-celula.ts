import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  // Simulate the session for Alexandre
  const userId = '456c3913-60b1-44e1-9a12-652997ff5050'; // Alexandre's id from earlier
  const userRole = 'LIDER'; // Assume he is a leader, not in training

  // Check role
  if (!['LIDER', 'LIDER_TREINAMENTO'].includes(userRole)) {
    console.log('User is not a leader or leader in training');
    return;
  }

  // Find cells where the user is the leader
  const cells = await prisma.cell.findMany({
    where: { leaderId: userId },
    include: { leader: true }
  });

  console.log(`User ${userId} leads ${cells.length} cells:`);
  for (const c of cells) {
    console.log(`  - ${c.name} (${c.id})`);
  }

  // If exactly one cell, the page would redirect to that cell's page
  if (cells.length === 1) {
    console.log(`Would redirect to /celulas/${cells[0].id}`);
  } else if (cells.length === 0) {
    console.log('Would show message: "Você não lidera nenhuma célula."');
  } else {
    console.log('Would show list of cells to choose from');
  }
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});