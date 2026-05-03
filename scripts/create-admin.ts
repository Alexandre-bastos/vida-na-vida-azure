import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@vidanavida.com';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  // No seu banco a tabela chama 'user' (minúsculo)
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      id: 'admin-manual-001', // ID manual pois o banco não gera UUID automático
      email,
      name: 'Administrador Vida na Vida',
      password: hashedPassword,
      role: 'ADMIN',
      updatedAt: new Date(), // Campo obrigatório após o pull
    },
  });

  console.log('✅ Usuário Admin criado/atualizado:');
  console.log('E-mail:', email);
  console.log('Senha:', password);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

