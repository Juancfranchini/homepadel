// Título y descripción de la portada (y de lo que se comparte en redes).
// Llevan "pádel" con tilde y "Argentina" porque es como se busca, y solo
// ganchos que la tienda cumple de verdad: el envío gratis por Correo Argentino
// depende del monto que se configura en el backoffice y las cuotas cambian
// con cada promo, así que no se escriben números que después queden viejos.
export const HOME_TITLE = 'Home Pádel — Paletas, indumentaria y accesorios de pádel en Argentina';
export const HOME_DESCRIPTION =
  'Paletas de pádel Nox, Royal Pádel, Adidas y más, con garantía oficial. Envío gratis a todo el país en compras desde el monto mínimo y cuotas sin interés.';

/**
 * Lo común a todo lo que se comparte. Sin título, descripción ni URL a
 * propósito: el objeto `openGraph` se hereda entero, y con esos datos acá
 * cualquier página compartida (/faq, /terminos…) aparecía como la portada.
 * Sin og:title, WhatsApp y Facebook usan el <title> de cada página. La
 * imagen sale de app/opengraph-image.tsx.
 */
export const OPEN_GRAPH_BASE = {
  type: 'website' as const,
  locale: 'es_AR',
  siteName: 'Home Pádel',
};
