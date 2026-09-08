'use client';

import { useState, useEffect } from 'react';
import { getProduct, getProducts } from '@/lib/api';
import { Product } from '@/types';
import { trackMetaEvent } from '@/lib/metaPixel';

export function useProductoData(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSizeGuide, setHasSizeGuide] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.allSettled([getProduct(slug + '?t=' + Date.now()), getProducts({ showAll: 1, limit: 50 })])
      .then(([prodRes, relRes]) => {
        const p = prodRes.status === 'fulfilled' ? (prodRes.value?.data ?? prodRes.value) : null;
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

  useEffect(() => {
    if (product) {
      trackMetaEvent('ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        content_name: product.name,
        value: product.salePrice ?? product.price,
        currency: 'ARS',
      });
    }
  }, [product]);

  return { product, related, loading, hasSizeGuide };
}
