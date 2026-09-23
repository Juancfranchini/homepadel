const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ProductoSeo {
  name: string;
  description?: string | null;
  sku?: string;
  price: number;
  effectivePrice: number;
  stock: number;
  isMadeToOrder?: boolean;
  images?: string[];
  brand?: { name: string } | null;
  category?: { name: string } | null;
  rating?: number;
  reviewCount?: number;
}

/**
 * Trae el producto desde el servidor para armar los metadatos y los datos
 * estructurados.
 *
 * Si la API no responde, devuelve null y la página se dibuja igual: la parte
 * interactiva vuelve a pedir el producto desde el navegador. Se pierde el
 * título propio de esa visita, no la ficha.
 */
export async function getProductoParaSeo(slug: string): Promise<ProductoSeo | null> {
  try {
    const res = await fetch(API_URL + '/products/' + encodeURIComponent(slug), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
