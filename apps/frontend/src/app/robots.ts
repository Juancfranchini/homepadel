import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';

/**
 * Le dice a Google qué puede recorrer y dónde está el mapa del sitio.
 *
 * Antes /robots.txt devolvía 404: el buscador no tenía ninguna indicación ni
 * forma de encontrar el sitemap, así que descubría las URLs solo, a los
 * tumbos.
 *
 * Se bloquean las páginas que no aportan nada en un buscador y que además no
 * conviene que aparezcan: el checkout, la cuenta del comprador y el
 * seguimiento de un pedido concreto.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/checkout/', '/cuenta', '/carrito', '/rastrear'],
    },
    sitemap: siteUrl + '/sitemap.xml',
  };
}
