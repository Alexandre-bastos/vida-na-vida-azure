import { BlobServiceClient } from '@azure/storage-blob';

/**
 * Utilitário de armazenamento para Azure Blob Storage.
 * Organiza arquivos em containers e pastas.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  // Fallback para log se a connection string não estiver configurada
  if (!connectionString) {
    console.error("[STORAGE] AZURE_STORAGE_CONNECTION_STRING não configurada!");
    // No ambiente local, poderíamos salvar no disco, mas para Azure/Produção precisamos do Blob.
    throw new Error("Configuração de armazenamento ausente (AZURE_STORAGE_CONNECTION_STRING)");
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Usamos um container único chamado 'uploads' para simplificar a gestão
    const containerName = 'uploads';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Cria o container se não existir (Opcional: Geralmente criado manualmente no portal)
    // await containerClient.createIfNotExists({ access: 'blob' });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const blobName = `${folder}/${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload do buffer
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    console.log(`[STORAGE] Arquivo enviado para Azure Blob: ${blobName}`);

    // Retorna a URL pública do arquivo
    // A URL segue o padrão: https://<account_name>.blob.core.windows.net/<container_name>/<blob_name>
    return blockBlobClient.url;
  } catch (error) {
    console.error("[STORAGE] Erro ao fazer upload para Azure Blob:", error);
    throw error;
  }
}
