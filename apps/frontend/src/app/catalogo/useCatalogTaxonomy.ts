'use client';

import { useState, useEffect } from 'react';
import { getCategories, getBrands } from '@/lib/api';
import { Category, Brand } from '@/types';

type Lista<T> = T[] | { data?: T[] };
const aLista = <T,>(respuesta: Lista<T>): T[] => (Array.isArray(respuesta) ? respuesta : respuesta?.data ?? []);

/**
 * Categorías y marcas para el panel de filtros. Los productos ya no se piden
 * acá: los trae el servidor con la primera página (ver page.tsx), así el HTML
 * sale con el listado y no hay una segunda carga al hidratar.
 */
export function useCatalogTaxonomy() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brs]: [Lista<Category>, Lista<Brand>]) => {
        setCategories(aLista(cats));
        setBrands(aLista(brs));
      })
      // Sin estas listas el panel queda sin opciones, pero el listado sigue: no amerita cortar la página.
      .catch((error) => console.error('[catalogo] no se pudieron cargar categorías y marcas:', error));
  }, []);

  return { categories, brands };
}
