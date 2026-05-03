import pkg from '../../node_modules/@prisma-generated/client/index.js';
// Cache bust: 2026-05-03 19:30
const { PrismaClient } = pkg;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV === 'production') {
  console.log("[PRISMA] Cliente inicializado para produção.");
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

