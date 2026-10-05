'use client';

import { useEffect, useRef } from 'react';
import type { Product } from '@/types';
import { trackMetaEvent } from '@/lib/metaPixel';
import { valoresDe } from './catalogQuery';

/**
 * ViewCategory a Meta al entrar a una categoría del catálogo, con su nombre en
 * `content_category` y los productos que se ven en `content_ids` (los mismos
 * IDs del feed). Reemplaza a "Vio accesorios" / "Vio Indumentaria", que
 * mandaba el pixel de Tiendanube sin productos ni categoría utilizables.
 *
 * Una vez por categoría elegida: paginar u ordenar dentro de la misma no es
 * una vista nueva.
 */
export function useVistaDeCategoria(seleccion: string, categorias: { slug: string; name: string }[], productos: Product[]): void {
  const ultima = useRef('');

  useEffect(() => {
    const slugs = valoresDe(seleccion);
    if (slugs.length === 0 || categorias.length === 0 || productos.length === 0) return;
    const clave = slugs.join(',');
    if (ultima.current === clave) return;
    ultima.current = clave;
    trackMetaEvent('ViewCategory', {
      content_category: slugs.map((slug) => categorias.find((c) => c.slug === slug)?.name.trim() ?? slug).join(', '),
      content_ids: productos.map((p) => p.id),
      content_type: 'product',
    });
  }, [seleccion, categorias, productos]);
}
