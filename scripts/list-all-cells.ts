import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listAll() {
  const cells = await prisma.cell.findMany({
    select: { id: true, name: true }
  });
  console.log(`Total cells: ${cells.length}`);
  for (const c of cells) {
    console.log(`- ${c.name} (${c.id})`);
  }
}

listAll().catch(e => {
  console.error(e);
  process.exit(1);
});