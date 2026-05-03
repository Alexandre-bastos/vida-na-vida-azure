import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const cells = await prisma.cell.findMany({ select: { id: true, name: true } });
  console.log('Cells:', JSON.stringify(cells, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });