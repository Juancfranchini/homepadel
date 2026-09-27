'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { isAxiosError } from 'axios';
import { getProduct, getProducts } from '@/lib/api';
import { Product } from '@/types';
import { trackMetaEvent } from '@/lib/metaPixel';

/** El backend manda la lista de relacionados elegidos a mano, aunque el tipo compartido no la declara. */
type ProductoConRelacionados = Product & { categoryId?: string; relatedProductIds?: string[] };
type ListaProductos = Product[] | { items?: Product[]; data?: Product[] };
interface GuiaTalles { productIds?: string[] }

function elegirRelacionados(respuesta: ListaProductos, producto: ProductoConRelacionados | null, slug: string): Product[] {
  const todos = Array.isArray(respuesta) ? respuesta : respuesta?.items ?? respuesta?.data ?? [];
  const elegidos = producto?.relatedProductIds ?? [];
  if (elegidos.length > 0) return todos.filter((x) => elegidos.includes(x.id));
  return todos.filter((x) => x.slug !== slug).slice(0, 6);
}

async function tieneGuiaDeTalles(producto: ProductoConRelacionados): Promise<boolean> {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/size-guides?categoryId=' + producto.categoryId);
  const data: { data?: GuiaTalles[] } | GuiaTalles[] = await res.json();
  const guias = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return guias.some((g) => g.productIds?.length === 0 || g.productIds?.includes(producto.id));
}

/**
 * Datos de la ficha. Arranca con el producto que ya trajo el servidor (así el
 * HTML sale con nombre, precio y descripción) y lo vuelve a pedir desde el
 * navegador sin caché, porque el del servidor puede tener hasta una hora.
 */
export function useProductoData(slug: string | undefined, initialProduct: Product | null) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [related, setRelated] = useState<Product[]>([]);
  // Con el producto del servidor no hay nada que esperar: se dibuja la ficha
  // y la consulta del navegador solo la actualiza, sin pasar por el esqueleto.
  const [loading, setLoading] = useState(!initialProduct);
  // Hasta que vuelve la consulta del navegador. ViewContent sale recién ahí,
  // con el precio fresco, igual que antes de que el servidor dibujara la ficha.
  const [refreshing, setRefreshing] = useState(true);
  // Distinto de "no existe" (404 real): la petición falló por red/servidor y
  // no sabemos si el producto existe o no — no corresponde decir "no encontrado".
  const [error, setError] = useState(false);
  const [hasSizeGuide, setHasSizeGuide] = useState(false);
  const vistoId = useRef<string | null>(null);

  const load = useCallback((conDatosPrevios: boolean) => {
    if (!slug) return;
    if (!conDatosPrevios) setLoading(true);
    setError(false);
    setRefreshing(true);
    // Los relacionados salen solo de los productos activos: uno dado de baja no se ofrece.
    Promise.allSettled([getProduct(slug + '?t=' + Date.now()), getProducts({ limit: 50 })])
      .then(([prodRes, relRes]) => {
        let vigente: ProductoConRelacionados | null = null;
        if (prodRes.status === 'fulfilled') {
          vigente = prodRes.value?.data ?? prodRes.value ?? null;
          setProduct(vigente);
        } else if (isAxiosError(prodRes.reason) && prodRes.reason.response?.status === 404) {
          setProduct(null);
        } else if (conDatosPrevios) {
          // Falló la actualización pero la ficha del servidor sigue siendo válida:
          // mejor mostrarla que tapar un producto real con un error de red.
          console.error('[producto] no se pudo actualizar ' + slug + ':', prodRes.reason);
          vigente = initialProduct;
        } else {
          setProduct(null);
          setError(true);
        }
        if (vigente) {
          tieneGuiaDeTalles(vigente).then(setHasSizeGuide).catch(() => setHasSizeGuide(false));
        }
        if (relRes.status === 'fulfilled') setRelated(elegirRelacionados(relRes.value, vigente, slug));
      })
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [slug, initialProduct]);

  useEffect(() => { load(initialProduct !== null); }, [load, initialProduct]);

  useEffect(() => {
    // Una vez por producto: la ficha ahora cambia dos veces (servidor y
    // navegador) y no son dos vistas. Los efectos no corren en el servidor.
    if (refreshing || !product || vistoId.current === product.id) return;
    vistoId.current = product.id;
    trackMetaEvent('ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: product.effectivePrice,
      currency: 'ARS',
    });
  }, [product, refreshing]);

  return { product, related, loading, error, retry: () => load(false), hasSizeGuide };
}
