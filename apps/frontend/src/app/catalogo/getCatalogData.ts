import type { Product } from '@/types';
import { getDesdeServidor } from '@/lib/serverApi';
import { buildProductsQuery, ITEMS_PER_PAGE, type CatalogFilters } from './catalogQuery';

export interface CatalogResult {
  products: Product[];
  totalCount: number;
  totalPages: number;
  /** La API no respondió: no es lo mismo que "no hay productos". */
  error: boolean;
}

interface RespuestaProductos {
  items?: Product[];
  total?: number;
  pages?: number;
}

export interface MarcaMenu { name: string; slug: string }
export interface CategoriaMenu { name: string; slug: string; brands: MarcaMenu[] }
export interface MenuCatalogo {
  categorias: CategoriaMenu[];
  marcas: MarcaMenu[];
  generos: string[];
}

/**
 * Página de productos para una combinación de filtros, pedida desde el
 * servidor. Un minuto de caché alcanza para que la página y sus metadatos
 * compartan la consulta y para no pegarle a la API en cada visita, sin que un
 * cambio de precio tarde en verse.
 */
export async function getCatalogProducts(filters: CatalogFilters): Promise<CatalogResult> {
  const res = await getDesdeServidor<RespuestaProductos | Product[]>('/products?' + buildProductsQuery(filters), 60);
  if (!res.ok) return { products: [], totalCount: 0, totalPages: 1, error: true };
  const data = res.data;
  const products = Array.isArray(data) ? data : data.items ?? [];
  const total = Array.isArray(data) ? products.length : data.total ?? products.length;
  const pages = Array.isArray(data) ? 1 : data.pages ?? Math.ceil(total / ITEMS_PER_PAGE);
  return { products, totalCount: total, totalPages: pages, error: false };
}

/**
 * Categorías con las marcas que de verdad tienen productos en cada una, y los
 * géneros cargados. Es la fuente de los títulos del catálogo: si una marca no
 * aparece acá, no se nombra.
 */
export async function getMenuCatalogo(): Promise<MenuCatalogo> {
  const res = await getDesdeServidor<Partial<MenuCatalogo>>('/categories/menu', 3600);
  if (!res.ok) return { categorias: [], marcas: [], generos: [] };
  return {
    categorias: res.data.categorias ?? [],
    marcas: res.data.marcas ?? [],
    generos: res.data.generos ?? [],
  };
}
