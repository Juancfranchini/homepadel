import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const logger = new Logger('BusquedaProductos');

/** Más de esto no aporta y sí alarga la consulta. */
const MAXIMO_PALABRAS = 6;

/** Una vez que se sabe que `unaccent` no está, no se reintenta en cada búsqueda. */
let unaccentDisponible: boolean | null = null;

export function palabrasDeBusqueda(search: unknown): string[] {
  return String(search ?? '').trim().split(/\s+/).filter(Boolean).slice(0, MAXIMO_PALABRAS);
}

/**
 * Filtro de búsqueda por texto, sin depender de la extensión `unaccent`.
 *
 * Se busca contra nombre, descripción, SKU, marca y categoría: antes solo se
 * miraba el nombre del producto, así que "royal" no devolvía nada aunque
 * hubiera 17 paletas de esa marca.
 *
 * Cada palabra tiene que aparecer en alguno de esos campos, no la frase
 * entera: así "bolso nox" trae el bolso de Nox y no todos los bolsos más todo
 * lo de Nox.
 */
export function buildSearchFilter(search: unknown): Record<string, unknown> | null {
  const palabras = palabrasDeBusqueda(search);
  if (palabras.length === 0) return null;

  return {
    AND: palabras.map((palabra) => ({
      OR: [
        { name: { contains: palabra, mode: 'insensitive' } },
        { description: { contains: palabra, mode: 'insensitive' } },
        { sku: { contains: palabra, mode: 'insensitive' } },
        { brand: { name: { contains: palabra, mode: 'insensitive' } } },
        { category: { name: { contains: palabra, mode: 'insensitive' } } },
      ],
    })),
  };
}

/**
 * Ids de los productos que coinciden con la búsqueda ignorando las tildes.
 *
 * Postgres compara "padel" y "Pádel" como distintos, así que buscar sin tilde
 * —que es como escribe la mayoría— no encontraba "Royal Pádel". `unaccent`
 * normaliza los dos lados antes de comparar.
 *
 * Devuelve null cuando no se puede usar: la extensión no está instalada, o la
 * consulta falló. Quien llama cae entonces al filtro con tildes, que encuentra
 * menos pero nunca de más.
 */
export async function idsPorBusquedaSinAcentos(
  prisma: PrismaService,
  search: unknown,
): Promise<string[] | null> {
  if (unaccentDisponible === false) return null;

  const palabras = palabrasDeBusqueda(search);
  if (palabras.length === 0) return null;

  // Un solo texto por producto con todo lo buscable, y una condición por
  // palabra: la consulta devuelve los que tienen todas.
  const condiciones = palabras.map(
    (palabra) => Prisma.sql`unaccent(lower(
      p."name" || ' ' || coalesce(p."description", '') || ' ' || p."sku" || ' ' || b."name" || ' ' || c."name"
    )) LIKE unaccent(lower(${'%' + palabra + '%'}))`,
  );

  try {
    const filas = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p."id"
      FROM "Product" p
      JOIN "Brand" b ON b."id" = p."brandId"
      JOIN "Category" c ON c."id" = p."categoryId"
      WHERE ${Prisma.join(condiciones, ' AND ')}
    `;
    unaccentDisponible = true;
    return filas.map((f) => f.id);
  } catch (err) {
    // `undefined_function` (42883) = la extensión no está instalada.
    unaccentDisponible = false;
    logger.warn(`Búsqueda sin acentos no disponible, se busca respetando las tildes: ${err}`);
    return null;
  }
}
