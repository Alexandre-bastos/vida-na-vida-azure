import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const cell = await prisma.cell.findFirst({
    where: {
      name: {
        contains: 'CELULA ONE'
      }
    },
    select: { 
      id: true, 
      name: true, 
      leaderId: true, 
      leader: { select: { id: true, name: true } }, 
      memberships: { select: { id: true, userId: true, user: { select: { id: true, name: true } } } }
    }
  });
  if (!cell) {
    console.log('Cell CELULA ONE not found');
    return;
  }
  console.log(`Cell: ${cell.name} (${cell.id})`);
  console.log(`Leader ID: ${cell.leaderId}`);
  console.log(`Leader: ${cell.leader?.name} (${cell.leader?.id})`);
  console.log(`Memberships count: ${cell.memberships.length}`);
  for (const m of cell.memberships) {
    console.log(`  - Membership ${m.id}: user ${m.user?.name} (${m.userId})`);
  }
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});