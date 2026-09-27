import type { Metadata } from 'next';
import CatalogoContent from './CatalogoContent';
import { buildCatalogMetadata } from './catalogMetadata';
import { leerDeObjeto, parseCatalogFilters } from './catalogQuery';
import { getCatalogProducts, getMenuCatalogo } from './getCatalogData';

/**
 * Catálogo.
 *
 * Antes era entero del navegador: quien pedía /catalogo?categoria=paletas sin
 * ejecutar JavaScript —Google, la vista previa de WhatsApp, el rastreador de
 * Meta— recibía solo "Cargando catálogo..." y ningún enlace a una ficha. Ahora
 * el servidor lee los filtros de la URL, trae la página de productos y la
 * dibuja; filtros, orden y paginación siguen siendo interactivos y, al
 * cambiarlos, la URL nueva vuelve a pasar por acá.
 *
 * Depende de la URL, así que se arma en cada pedido; las consultas a la API
 * sí quedan en caché un rato (ver getCatalogData).
 */

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseCatalogFilters(leerDeObjeto(await searchParams));
  // Misma consulta que la página: Next la resuelve una sola vez por pedido.
  const [menu, result] = await Promise.all([getMenuCatalogo(), getCatalogProducts(filters)]);
  return buildCatalogMetadata(filters, menu, result);
}

export default async function CatalogoPage({ searchParams }: Props) {
  const filters = parseCatalogFilters(leerDeObjeto(await searchParams));
  const result = await getCatalogProducts(filters);
  return <CatalogoContent result={result} />;
}
