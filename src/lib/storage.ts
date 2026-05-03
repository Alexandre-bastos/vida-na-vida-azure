import fs from 'node:fs';
import path from 'node:path';

/**
 * Utilitário de armazenamento agnóstico.
 * No ambiente Azure/Linux, salva arquivos localmente na pasta public/uploads.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  // Caminho relativo para a URL (como o navegador verá)
  const relativePath = `/uploads/${folder}/${fileName}`;
  
  // Caminho absoluto para salvar o arquivo no disco
  // Em produção na Azure, a pasta public pode estar em dist/client/public ou similar
  // Mas para o build do Astro, salvamos na pasta public da raiz
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const absolutePath = path.join(uploadDir, fileName);
  fs.writeFileSync(absolutePath, buffer);
  
  console.log(`[STORAGE] Arquivo salvo em: ${absolutePath}`);
  
  return relativePath;
}
