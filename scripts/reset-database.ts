import { PrismaClient } from '@prisma/client';
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function clearStorage() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.log('⚠️ AZURE_STORAGE_CONNECTION_STRING não encontrada. Pulando limpeza de arquivos.');
    return;
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('uploads');
    
    console.log('📂 Acessando container de "uploads" para limpeza...');
    
    let i = 0;
    for await (const blob of containerClient.listBlobsFlat()) {
      await containerClient.deleteBlob(blob.name);
      i++;
    }
    
    console.log(`✅ Limpeza de arquivos concluída: ${i} arquivos removidos.`);
  } catch (error) {
    console.error('❌ Erro ao limpar storage:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando script de limpeza da base de dados...');

  try {
    // 1. Limpar Arquivos do Azure Blob
    await clearStorage();

    // 2. Limpar Tabelas do Banco de Dados (Ordem inversa das dependências)
    console.log('🧹 Limpando tabelas do banco de dados...');
    
    // Deletar presenças e participações primeiro
    await prisma.presence.deleteMany({});
    await prisma.visitorattendance.deleteMany({});
    
    // Deletar encontros, avisos e lições
    await prisma.meeting.deleteMany({});
    await prisma.notice.deleteMany({});
    await prisma.lesson.deleteMany({});
    
    // Deletar visitantes
    await prisma.visitor.deleteMany({});
    
    // Deletar membros de células
    await prisma.cellmembership.deleteMany({});
    
    // Deletar células
    await prisma.cell.deleteMany({});
    
    // Deletar contas e sessões
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.verificationtoken.deleteMany({});

    // Deletar todos os usuários EXCETO o admin
    // Buscamos o admin pelo e-mail padrão ou role
    const adminEmail = 'vidanavida'; // Ajuste se o e-mail do admin for diferente
    
    const deleteUsersResult = await prisma.user.deleteMany({
      where: {
        NOT: {
          OR: [
            { email: adminEmail },
            { role: 'ADMIN' }
          ]
        }
      }
    });

    console.log(`✅ Banco de dados limpo! ${deleteUsersResult.count} usuários removidos.`);
    console.log('✨ Operação concluída com sucesso. Apenas usuários ADMIN foram mantidos.');

  } catch (error) {
    console.error('❌ Erro crítico durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
