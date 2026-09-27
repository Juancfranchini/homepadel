import type { Product } from '@/types';
import { getDesdeServidor } from '@/lib/serverApi';

/**
 * Trae el producto desde el servidor. Con esto se arman los metadatos, los
 * datos estructurados y el primer dibujo de la ficha, así el HTML que recibe
 * un buscador ya trae nombre, precio, descripción y especificaciones.
 *
 * Si la API no responde, devuelve null y la página se dibuja igual: la parte
 * interactiva vuelve a pedir el producto desde el navegador. Se pierde el
 * título propio de esa visita, no la ficha.
 */
export async function getProductoParaSeo(slug: string): Promise<Product | null> {
  const res = await getDesdeServidor<Product>('/products/' + encodeURIComponent(slug), 3600);
  return res.ok ? res.data : null;
}
