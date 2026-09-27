import { DEFAULT_SORT } from './sortOptions';

/**
 * Traducción de la URL del catálogo (?categoria=paletas&marca=nox...) a la
 * consulta de la API. Vive acá, sin 'use client', porque la usan el servidor
 * —que arma la primera página y los metadatos— y el navegador —que arma los
 * filtros—. Si cada uno leyera la URL a su manera, el HTML inicial y la
 * pantalla podrían mostrar listados distintos para la misma dirección.
 */

export const ITEMS_PER_PAGE = 12;

export interface CatalogFilters {
  currentPage: number;
  currentSort: string;
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  searchQuery: string;
  selectedSize: string;
  selectedColor: string;
  selectedWeight: string;
  selectedShape: string;
  selectedGender: string;
  selectedLevel: string;
  minPrice: number | null;
  maxPrice: number | null;
}

/** Lo mínimo de URLSearchParams que se necesita, para aceptar también los del servidor. */
type LeerParam = (clave: string) => string | null;

function precioDeParam(valor: string | null): number | null {
  if (!valor) return null;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function paginaDeParam(valor: string | null): number {
  const n = Number(valor || '1');
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function parseCatalogFilters(get: LeerParam): CatalogFilters {
  return {
    currentPage: paginaDeParam(get('page')),
    currentSort: get('sort') || DEFAULT_SORT,
    selectedCategory: get('categoria') || '',
    selectedBrand: get('marca') || '',
    isOffer: get('oferta') === 'true',
    searchQuery: get('q') || '',
    selectedSize: get('talle') || '',
    selectedColor: get('color') || '',
    selectedWeight: get('peso') || '',
    selectedShape: get('formato') || '',
    selectedGender: get('genero') || '',
    selectedLevel: get('nivel') || '',
    minPrice: precioDeParam(get('desde')),
    maxPrice: precioDeParam(get('hasta')),
  };
}

/** Adaptador para los searchParams que Next le pasa a una página del servidor. */
export function leerDeObjeto(params: Record<string, string | string[] | undefined>): LeerParam {
  return (clave) => {
    const valor = params[clave];
    return (Array.isArray(valor) ? valor[0] : valor) ?? null;
  };
}

export function buildProductsQuery(f: CatalogFilters): URLSearchParams {
  // El orden viaja a la API: ordenar del lado del navegador solo reacomodaría
  // los doce productos de la página visible.
  const q = new URLSearchParams({ page: String(f.currentPage), limit: String(ITEMS_PER_PAGE), sort: f.currentSort });
  if (f.selectedCategory) q.set('category', f.selectedCategory);
  if (f.selectedBrand) q.set('brand', f.selectedBrand);
  if (f.isOffer) q.set('isOffer', 'true');
  if (f.searchQuery) q.set('search', f.searchQuery);
  if (f.selectedSize) q.set('size', f.selectedSize);
  if (f.selectedColor) q.set('color', f.selectedColor);
  if (f.selectedShape) q.set('shape', f.selectedShape);
  if (f.selectedGender) q.set('gender', f.selectedGender);
  if (f.selectedLevel) q.set('level', f.selectedLevel);
  if (f.minPrice != null) q.set('minPrice', String(f.minPrice));
  if (f.maxPrice != null) q.set('maxPrice', String(f.maxPrice));
  if (f.selectedWeight) {
    const [weightValue, unit] = f.selectedWeight.split(' ');
    q.set('weight', weightValue);
    if (unit) q.set('weightUnit', unit);
  }
  return q;
}
