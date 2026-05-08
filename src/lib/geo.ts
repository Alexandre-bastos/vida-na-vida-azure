import prisma from './prisma';

const DEFAULT_CITY = 'Rio de Janeiro, RJ';

/**
 * Tenta obter coordenadas para um bairro, primeiro no banco e depois via API.
 */
export async function getCoordinatesForNeighborhood(neighborhood: string | null): Promise<{ lat: number, lng: number } | null> {
  if (!neighborhood) return null;

  // 1. Busca no banco de dados para evitar chamadas de API repetitivas
  const existing = await prisma.user.findFirst({
    where: { neighborhood, latitude: { not: null } },
    select: { latitude: true, longitude: true }
  }) || await prisma.cell.findFirst({
    where: { neighborhood, latitude: { not: null } },
    select: { latitude: true, longitude: true }
  });

  if (existing && existing.latitude && existing.longitude) {
    return { lat: existing.latitude, lng: existing.longitude };
  }

  // 2. Geocodificação via Nominatim (OpenStreetMap)
  try {
    const query = encodeURIComponent(`${neighborhood}, ${DEFAULT_CITY}`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        'User-Agent': 'VidaNaVidaApp/1.0'
      }
    });

    const data = await response.json() as any[];
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Erro ao geocodificar bairro "${neighborhood}":`, error);
  }

  return null;
}

/**
 * Tenta obter coordenadas para um endereço completo (Células).
 */
export async function getCoordinatesForCell(address: string | null, neighborhood: string | null): Promise<{ lat: number, lng: number } | null> {
  if (!address && !neighborhood) return null;

  const searchQuery = [address, neighborhood, DEFAULT_CITY].filter(Boolean).join(', ');

  try {
    const query = encodeURIComponent(searchQuery);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        'User-Agent': 'VidaNaVidaApp/1.0'
      }
    });

    const data = await response.json() as any[];
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Erro ao geocodificar endereço "${searchQuery}":`, error);
  }

  return null;
}
