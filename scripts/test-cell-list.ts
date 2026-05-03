import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  // Simulate the session for Alexandre
  const userId = '456c3913-60b1-44e1-9a12-652997ff5050'; // Alexandre's id from earlier
  const userRole = 'LIDER'; // Assume he is a leader, not in training

  const isAdmin = userRole === 'ADMIN';
  const isCoordinator = userRole === 'COORDENADOR';
  const isLeader = userRole === 'LIDER' || userRole === 'LIDER_TREINAMENTO';

  // Build whereClause as in the cell list page
  let whereClause = {};
  if (isAdmin || isCoordinator) {
    // Administradores e coordenadores veem todas as células
    whereClause = {};
  } else if (isLeader) {
    // Líderes e líderes de treinamento veem apenas as células onde são líderes
    // ou onde têm membership ativo
    whereClause = {
      OR: [
        { leaderId: userId },
        { memberships: { some: { userId, endDate: null } } }
      ]
    };
  }
  // Note: member case is not handled here because we are testing as leader

  console.log('whereClause:', JSON.stringify(whereClause, null, 2));

  // Find cells with this whereClause
  const cells = await prisma.cell.findMany({
    where: whereClause,
    include: {
      leader: true,
      _count: {
        select: { memberships: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  console.log(`Found ${cells.length} cells:`);
  for (const c of cells) {
    console.log(`  - ${c.name} (${c.id}) - Leader: ${c.leader?.name} - Members: ${c._count.memberships}`);
  }
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});