import prisma from './prisma';

export const getUserCells = async (userId: string) => {
  const cellMemberships = await prisma.cellmembership.findMany({
    where: { userId },
    select: { cellId: true }
  });
  const cellIds = cellMemberships.map(cm => cm.cellId);
  return await prisma.cell.findMany({ where: { id: { in: cellIds } } });
};

