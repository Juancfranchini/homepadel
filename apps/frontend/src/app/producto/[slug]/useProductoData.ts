'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProduct, getProducts } from '@/lib/api';
import { Product } from '@/types';
import { trackMetaEvent } from '@/lib/metaPixel';

export function useProductoData(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Distinto de "no existe" (404 real): la petición falló por red/servidor y
  // no sabemos si el producto existe o no — no corresponde decir "no encontrado".
  const [error, setError] = useState(false);
  const [hasSizeGuide, setHasSizeGuide] = useState(false);

  const load = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    Promise.allSettled([getProduct(slug + '?t=' + Date.now()), getProducts({ showAll: 1, limit: 50 })])
      .then(([prodRes, relRes]) => {
        const p = prodRes.status === 'fulfilled' ? (prodRes.value?.data ?? prodRes.value) : null;
        if (prodRes.status === 'rejected') {
          const status = (prodRes.reason as any)?.response?.status;
          if (status !== 404) setError(true);
        }
        setProduct(p ?? null);
        if (p) {
          fetch(process.env.NEXT_PUBLIC_API_URL + '/size-guides?categoryId=' + p.categoryId)
            .then(r => r.json())
            .then(data => {
              const guides = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
              const hasGuide = guides.some((g: any) => g.productIds?.length === 0 || g.productIds?.includes(p.id));
              setHasSizeGuide(hasGuide);
            })
            .catch(() => setHasSizeGuide(false));
        }
        if (relRes.status === 'fulfilled') {
          const all: Product[] = Array.isArray(relRes.value) ? relRes.value : (relRes.value as any)?.items ?? (relRes.value as any)?.data ?? [];
          const relatedIds: string[] = (p as any)?.relatedProductIds || [];
          if (relatedIds.length > 0) { setRelated(all.filter((x) => relatedIds.includes(x.id))); }
          else { setRelated(all.filter((x) => x.slug !== slug).slice(0, 6)); }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (product) {
      trackMetaEvent('ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        content_name: product.name,
        value: product.effectivePrice,
        currency: 'ARS',
      });
    }
  }, [product]);

  return { product, related, loading, error, retry: load, hasSizeGuide };
}
