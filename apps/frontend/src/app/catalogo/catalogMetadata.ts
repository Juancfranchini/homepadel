import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';
import { OPEN_GRAPH_BASE } from '@/lib/seoPortada';
import { valoresDe, type CatalogFilters } from './catalogQuery';
import type { CatalogResult, MenuCatalogo, MarcaMenu } from './getCatalogData';

/** Más de tres marcas y el título se corta en Google; el resto va en la descripción. */
const MARCAS_EN_TITULO = 3;

/** "a, b y c" — con "e" delante de i/hi, como corresponde en castellano. */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  const ultimo = items[items.length - 1];
  const conjuncion = /^h?i(?!e)/i.test(ultimo) ? ' e ' : ' y ';
  return items.slice(0, -1).join(', ') + conjuncion + ultimo;
}

function marcasParaTitulo(marcas: MarcaMenu[]): string {
  const nombres = marcas.map((m) => m.name);
  if (nombres.length <= MARCAS_EN_TITULO) return enumerar(nombres);
  return nombres.slice(0, MARCAS_EN_TITULO).join(', ') + ' y más';
}

/** Hombre/Mujer existen si hay productos de ese género o unisex (el backend los incluye al filtrar). */
function generoValido(genero: string, generos: string[]): string | null {
  if (!genero || !generos.length) return null;
  if (generos.includes(genero)) return genero;
  return ['Hombre', 'Mujer'].includes(genero) && generos.includes('Unisex') ? genero : null;
}

interface Encabezado {
  /** Para <title>: corto, con a lo sumo tres marcas. */
  titulo: string;
  /** Para la descripción: todas las marcas. */
  completo: string;
}

/**
 * Título armado solo con lo que existe: la categoría, la marca y el género
 * salen de /categories/menu, y las marcas listadas son las que tienen
 * productos en esa categoría. Un slug que no figura ahí no se nombra.
 */
function encabezado(f: CatalogFilters, menu: MenuCatalogo): Encabezado {
  const cat = menu.categorias.find((c) => c.slug === f.selectedCategory);
  const marca = menu.marcas.find((m) => m.slug === f.selectedBrand) ?? cat?.brands.find((m) => m.slug === f.selectedBrand);
  const genero = generoValido(f.selectedGender, menu.generos);
  const paraGenero = genero ? ' para ' + genero.toLowerCase() : '';

  if (!cat && !marca && !genero && !f.isOffer) {
    // Solo los rubros que hoy tienen productos: uno vacío no se ofrece.
    const rubros = menu.categorias.filter((c) => c.brands.length > 0).map((c) => c.name.toLowerCase());
    return { titulo: 'Catálogo de pádel', completo: 'Catálogo de pádel' + (rubros.length ? ': ' + enumerar(rubros) : '') };
  }

  let titulo: string;
  let completo: string;
  if (marca && !cat) {
    const rubros = menu.categorias.filter((c) => c.brands.some((b) => b.slug === marca.slug)).map((c) => c.name.toLowerCase());
    titulo = completo = marca.name + ': ' + (enumerar(rubros) || 'productos') + ' de pádel' + paraGenero;
  } else {
    const base = (cat ? cat.name : 'Productos') + (marca ? ' ' + marca.name : '') + ' de pádel' + paraGenero;
    const marcasDeCat = cat && !marca ? cat.brands : [];
    titulo = marcasDeCat.length ? base + ' ' + marcasParaTitulo(marcasDeCat) : base;
    completo = marcasDeCat.length ? base + ' ' + enumerar(marcasDeCat.map((m) => m.name)) : base;
  }
  if (f.isOffer) {
    titulo = 'Ofertas en ' + titulo.charAt(0).toLowerCase() + titulo.slice(1);
    completo = 'Ofertas en ' + completo.charAt(0).toLowerCase() + completo.slice(1);
  }
  return { titulo, completo };
}

/**
 * La URL canónica conserva solo lo que define una página propia (categoría,
 * marca, género, ofertas, página). Talle, color, precio u orden son variantes
 * del mismo listado: si cada combinación se indexara por separado, Google
 * vería cientos de páginas casi iguales compitiendo entre sí.
 */
function urlCanonica(f: CatalogFilters): string {
  const q = new URLSearchParams();
  if (f.selectedCategory) q.set('categoria', f.selectedCategory);
  if (f.selectedBrand) q.set('marca', f.selectedBrand);
  if (f.selectedGender) q.set('genero', f.selectedGender);
  if (f.isOffer) q.set('oferta', 'true');
  if (f.currentPage > 1) q.set('page', String(f.currentPage));
  const query = q.toString();
  return getSiteUrl() + '/catalogo' + (query ? '?' + query : '');
}

/**
 * Una combinación de varias marcas, categorías o géneros (?marca=nox,royal) no
 * es una página para el buscador: con todas las combinaciones posibles, Google
 * vería cientos de listados casi iguales. Se titula y se canoniza como el
 * listado sin esos filtros, y no se indexa.
 */
function sinFiltrosCombinados(f: CatalogFilters): { base: CatalogFilters; combinado: boolean } {
  const multiple = (v: string) => valoresDe(v).length > 1;
  const combinado = multiple(f.selectedCategory) || multiple(f.selectedBrand) || multiple(f.selectedGender);
  if (!combinado) return { base: f, combinado };
  return {
    base: {
      ...f,
      selectedCategory: multiple(f.selectedCategory) ? '' : f.selectedCategory,
      selectedBrand: multiple(f.selectedBrand) ? '' : f.selectedBrand,
      selectedGender: multiple(f.selectedGender) ? '' : f.selectedGender,
    },
    combinado,
  };
}

export function buildCatalogMetadata(filtros: CatalogFilters, menu: MenuCatalogo, result: CatalogResult): Metadata {
  const { base: f, combinado } = sinFiltrosCombinados(filtros);
  const { titulo, completo } = encabezado(f, menu);
  const pagina = f.currentPage > 1 ? ' — página ' + f.currentPage : '';
  const title = (f.searchQuery ? 'Resultados para "' + f.searchQuery + '"' : titulo) + pagina;
  const envios = 'envíos a todo el país y múltiples medios de pago.';
  const description = result.error
    ? completo + '. Con ' + envios
    : completo + '. ' + result.totalCount + (result.totalCount === 1 ? ' producto disponible' : ' productos disponibles') + ', con ' + envios;
  const url = urlCanonica(f);
  const imagen = result.products[0]?.images?.[0];

  // Una búsqueda o un listado vacío no son páginas para el buscador; se siguen
  // los enlaces igual para que lleguen a las fichas.
  const indexable = !combinado && !f.searchQuery && !result.error && result.totalCount > 0;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      url,
      title,
      description,
      images: imagen ? [{ url: imagen, alt: result.products[0].name }] : undefined,
    },
  };
}
