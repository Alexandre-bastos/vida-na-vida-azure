import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Cidade padrão para as buscas (ajuste para sua cidade)
const DEFAULT_CITY = 'Rio de Janeiro, RJ';

async function geocode(address: string): Promise<{ lat: number, lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${DEFAULT_CITY}`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        'User-Agent': 'VidaNaVidaApp/1.0 (contato@seusite.com)'
      }
    });

    const data = await response.json() as any[];
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error(`❌ Erro ao geocodificar "${address}":`, error);
    return null;
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🌍 Iniciando geocodificação de dados...');

  // 1. Geocodificar Células
  const cells = await prisma.cell.findMany({
    where: { latitude: null }
  });

  console.log(`📍 Processando ${cells.length} células...`);
  for (const cell of cells) {
    const address = cell.address || cell.neighborhood || '';
    if (address) {
      console.log(`🔍 Buscando coordenadas para célula: ${cell.name} (${address})...`);
      const coords = await geocode(address);
      if (coords) {
        await prisma.cell.update({
          where: { id: cell.id },
          data: { latitude: coords.lat, longitude: coords.lng }
        });
        console.log(`✅ Coordenadas salvas: ${coords.lat}, ${coords.lng}`);
      }
      await delay(1000); // Respeitar limite de 1req/sec do Nominatim
    }
  }

  // 2. Geocodificar Usuários (agrupado por bairro para eficiência)
  const usersWithNeighborhood = await prisma.user.findMany({
    where: { neighborhood: { not: null }, latitude: null },
    select: { neighborhood: true }
  });

  const neighborhoods = [...new Set(usersWithNeighborhood.map(u => u.neighborhood))];
  console.log(`🏘️ Processando ${neighborhoods.length} bairros únicos de membros...`);

  for (const neighborhood of neighborhoods) {
    if (neighborhood) {
      console.log(`🔍 Buscando coordenadas para bairro: ${neighborhood}...`);
      const coords = await geocode(neighborhood);
      if (coords) {
        await prisma.user.updateMany({
          where: { neighborhood, latitude: null },
          data: { latitude: coords.lat, longitude: coords.lng }
        });
        console.log(`✅ Bairro "${neighborhood}" atualizado.`);
      }
      await delay(1000);
    }
  }

  console.log('✨ Geocodificação concluída!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
