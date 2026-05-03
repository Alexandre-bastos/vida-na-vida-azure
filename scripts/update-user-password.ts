import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'silva.bastos@gmail.com';
  const newPassword = 'papai123';
  const hashed = await bcrypt.hash(newPassword, 10);
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashed, active: true },
  });
  console.log('✅ Senha atualizada com sucesso:');
  console.log(`E-mail: ${user.email}`);
  console.log(`Novo hash: ${user.password}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao atualizar a senha:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });