import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  // Simulate the session for Alexandre
  const userId = '456c3913-60b1-44e1-9a12-652997ff5050'; // Alexandre's id from earlier
  const userRole = 'LIDER'; // Assume he is a leader, not in training

  const isAdmin = userRole === 'ADMIN';
  const isCoordinator = userRole === 'COORDENADOR';
  const isLeader = userRole === 'LIDER' || userRole === 'LIDER_TREINAMENTO';

  // Find the cell CELULA ONE
  const cell = await prisma.cell.findFirst({
    where: {
      name: {
        contains: 'CELULA ONE'
      }
    }
  });
  if (!cell) {
    console.log('Cell CELULA ONE not found');
    return;
  }
  console.log(`Found cell: ${cell.name} (${cell.id})`);

  // Build accessWhere as in the cell page
  let accessWhere = {} as any;
  if (isAdmin || isCoordinator) {
    accessWhere = { id: cell.id };
  } else if (isLeader) {
    accessWhere = {
      id: cell.id,
      OR: [
        { leaderId: userId },
        { memberships: { some: { userId, endDate: null } } }
      ]
    };
  } else {
    // membro comum
    accessWhere = {
      id: cell.id,
      memberships: { some: { userId, endDate: null } }
    };
  }

  console.log('accessWhere:', JSON.stringify(accessWhere, null, 2));

  // Try to find the cell with this accessWhere
  const accessibleCell = await prisma.cell.findFirst({
    where: accessWhere,
    include: {
      leader: true,
      memberships: {
        where: { endDate: null },
        include: { user: true }
      }
    }
  });

  if (!accessibleCell) {
    console.log('Access denied: cell not found with accessWhere');
    return;
  }
  console.log('Access granted: cell found');
  console.log(`Cell: ${accessibleCell.name} (${accessibleCell.id})`);

  // Check permissions
  const isCellLeader = !!accessibleCell.leader && userId === accessibleCell.leader.id;
  const isTrainingLeader = userRole === 'LIDER_TREINAMENTO';
  const isMember = accessibleCell.memberships.some(m => m.user.id === userId);
  const canManageCell = isAdmin || isCellLeader || isTrainingLeader;
  const canViewCell = isAdmin || isCoordinator || isCellLeader || isTrainingLeader || isMember;

  console.log('isCellLeader:', isCellLeader);
  console.log('isTrainingLeader:', isTrainingLeader);
  console.log('isMember:', isMember);
  console.log('canManageCell:', canManageCell);
  console.log('canViewCell:', canViewCell);

  // Check availableUsers for adding members
  const availableUsers = await prisma.user.findMany({
    where: {
      cellHistory: {
        none: { endDate: null }
      }
    },
    orderBy: { name: 'asc' }
  });
  console.log(`Available users count: ${availableUsers.length}`);
  // Show first 5
  for (let i = 0; i < Math.min(5, availableUsers.length); i++) {
    const u = availableUsers[i];
    console.log(`  - ${u.name} (${u.id}) - ${u.role}`);
  }
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});