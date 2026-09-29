import { NextResponse, type NextRequest } from 'next/server';
import {
  parseLegacyPath,
  resolveLegacyDestination,
  type BrandCandidate,
  type LegacyLookups,
  type ProductCandidate,
  withAttribution,
} from '@/lib/legacyUrls';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

/**
 * Si la API tarda, mejor redirigir al buscador que dejar a Google esperando:
 * la redirección sale igual, solo que menos precisa.
 */
const API_TIMEOUT_MS = 3000;

// fetch directo y no lib/api.ts: el middleware corre en el runtime Edge, donde
// no conviene cargar Axios, y acá hace falta el timeout por request.
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_URL + path, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });
  if (!res.ok) throw new Error('GET ' + path + ' respondió ' + res.status);
  return (await res.json()) as T;
}

const lookups: LegacyLookups = {
  async searchProducts(query) {
    const data = await getJson<{ items?: ProductCandidate[] }>(
      '/products?limit=20&search=' + encodeURIComponent(query),
    );
    return data.items ?? [];
  },
  async brandsOfCategory(category) {
    // El menú trae, por categoría, solo las marcas que tienen productos en
    // ella: así /zapatillas/nox/ no termina en un listado vacío.
    const menu = await getJson<{ categorias?: { slug: string; brands?: BrandCandidate[] }[] }>('/categories/menu');
    return menu.categorias?.find((c) => c.slug === category)?.brands ?? [];
  },
};

/**
 * Redirige las URLs viejas de Tiendanube que Google todavía tiene indexadas
 * (ver lib/legacyUrls.ts). 308 = permanente: Google transfiere el
 * posicionamiento a la URL nueva y deja de pedir la vieja.
 */
export async function middleware(request: NextRequest) {
  const route = parseLegacyPath(request.nextUrl.pathname);
  if (!route) return NextResponse.next();

  const destination = await resolveLegacyDestination(route, lookups).catch((err: unknown) => {
    console.error('No se pudo resolver la URL vieja ' + request.nextUrl.pathname + ':', err);
    return '/catalogo';
  });
  // Sin los utm/fbclid/gclid el anuncio que trajo la visita pierde la atribución.
  return NextResponse.redirect(new URL(withAttribution(destination, request.nextUrl.search), request.nextUrl), 308);
}

export const config = {
  // Solo las rutas de Tiendanube, para no sumarle latencia al resto del
  // sitio. Equivale a /(productos|paletas|accesorios|indumentaria|zapatillas|bolsos)(/…)?
  // sin distinguir mayúsculas: el matcher de Next no acepta flags de regex y
  // tiene que ser un literal (no puede armarse desde LEGACY_CATEGORY_SLUGS).
  // Si se suma una categoría a esa lista, agregarla también acá.
  matcher: [
    '/((?:[pP][rR][oO][dD][uU][cC][tT][oO][sS]|[pP][aA][lL][eE][tT][aA][sS]|[aA][cC][cC][eE][sS][oO][rR][iI][oO][sS]|[iI][nN][dD][uU][mM][eE][nN][tT][aA][rR][iI][aA]|[zZ][aA][pP][aA][tT][iI][lL][lL][aA][sS]|[bB][oO][lL][sS][oO][sS])(?:/.*)?)',
  ],
};
