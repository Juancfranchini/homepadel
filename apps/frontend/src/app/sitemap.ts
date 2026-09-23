import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';

/** Se regenera cada hora: el catálogo cambia seguido pero no a cada minuto. */
export const revalidate = 3600;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/** Páginas que existen siempre, con su peso relativo. */
const FIJAS: { ruta: string; prioridad: number }[] = [
  { ruta: '', prioridad: 1 },
  { ruta: '/catalogo', prioridad: 0.9 },
  { ruta: '/contacto', prioridad: 0.5 },
  { ruta: '/faq', prioridad: 0.5 },
  { ruta: '/envios', prioridad: 0.4 },
  { ruta: '/medios-de-pago', prioridad: 0.4 },
  { ruta: '/politica-de-devolucion', prioridad: 0.3 },
  { ruta: '/talles', prioridad: 0.3 },
  { ruta: '/terminos', prioridad: 0.2 },
  { ruta: '/privacidad', prioridad: 0.2 },
];

async function traer<T>(ruta: string): Promise<T[]> {
  try {
    const res = await fetch(API_URL + ruta, { next: { revalidate } });
    if (!res.ok) return [];
    const datos = await res.json();
    return Array.isArray(datos) ? datos : (datos?.items ?? []);
  } catch {
    // Sin catálogo el sitemap sale igual con las páginas fijas: es preferible
    // a devolver un 500 y quedarse sin ninguno.
    return [];
  }
}

/**
 * Mapa del sitio, armado con el catálogo real.
 *
 * Antes /sitemap.xml devolvía 404. Google no tenía forma de saber que existían
 * las 43 fichas de producto ni las categorías: tenía que descubrirlas siguiendo
 * enlaces, que en un catálogo que se arma en el navegador es poco confiable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [productos, categorias, marcas] = await Promise.all([
    traer<{ slug: string; updatedAt?: string }>('/products?limit=500'),
    traer<{ slug: string }>('/categories'),
    traer<{ slug: string }>('/brands'),
  ]);

  return [
    ...FIJAS.map((p) => ({
      url: siteUrl + p.ruta,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p.prioridad,
    })),
    ...productos.filter((p) => p.slug).map((p) => ({
      url: siteUrl + '/producto/' + p.slug,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...categorias.filter((c) => c.slug).map((c) => ({
      url: siteUrl + '/catalogo?categoria=' + c.slug,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...marcas.filter((m) => m.slug).map((m) => ({
      url: siteUrl + '/catalogo?marca=' + m.slug,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
