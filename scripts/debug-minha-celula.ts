import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debug() {
  // Simulate getting session from request (we'll hardcode for Alexandre)
  // In real code, this comes from getSession(Astro.request)
  // Let's assume we have a session with user object
  const session = {
    user: {
      id: '456c3913-60b1-44e1-9a12-652997ff5050',
      name: 'Alexandre Bastos',
      role: 'LIDER'
    }
  };
  if (!session) {
    console.log('No session');
    return;
  }
  const userId = (session.user as any)?.id;
  const userRole = (session.user as any)?.role || 'MEMBRO';
  console.log(`User ID: ${userId}`);
  console.log(`User Role: ${userRole}`);

  if (!['LIDER', 'LIDER_TREINAMENTO'].includes(userRole)) {
    console.log('User is not a leader or leader in training');
    return;
  }

  const cells = await prisma.cell.findMany({
    where: { leaderId: userId },
    include: { leader: true }
  });

  console.log(`Found ${cells.length} cells where user is leader:`);
  for (const c of cells) {
    console.log(`  - ${c.name} (${c.id}) - Leader: ${c.leader?.name}`);
  }

  // If exactly one cell, the page would redirect
  if (cells.length === 1) {
    console.log(`Would redirect to /celulas/${cells[0].id}`);
  } else if (cells.length === 0) {
    console.log('Would show message: "Você não lidera nenhuma célula."');
  } else {
    console.log('Would show list of cells to choose from');
  }
}

debug().catch(e => {
  console.error(e);
  process.exit(1);
});