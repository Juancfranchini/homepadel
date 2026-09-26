'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';

// Tope del backend (ProductsService.findAll) — cubre catálogos chicos como
// este entero. Si el catálogo crece mucho más, esto necesita un endpoint de
// facetas propio en vez de traer todo para calcular las opciones.
const LIMITE_PARA_FACETAS = 100;

interface Params {
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  searchQuery: string;
}

function valoresUnicos(products: Product[], key: 'size' | 'color', hasKey: 'hasSize' | 'hasColor') {
  return [...new Set(products.flatMap((p) => [
    ...(p[hasKey] && p[key] ? [p[key] as string] : []),
    ...(p.variants?.filter((v) => p[hasKey] && v.active && v[key]).map((v) => v[key] as string) || []),
  ]))];
}

/**
 * Las opciones de un filtro (talle, color, peso, género) tienen que salir de
 * todo lo que hay en el catálogo, no solo de los 12 productos de la página
 * visible — si no, una opción real (por ejemplo "Mujer") desaparecía del
 * desplegable solo porque esos productos no entraban en la primera página.
 *
 * Por eso esto es un fetch aparte, con category/brand/búsqueda pero sin
 * paginar ni filtrar por los atributos que está calculando: elegir "Mujer"
 * no debe hacer desaparecer "Hombre" de la misma lista.
 */
export function useCatalogFacets({ selectedCategory, selectedBrand, isOffer, searchQuery }: Params) {
  const [products, setProducts] = useState<Product[]>([]);

  const load = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { limit: LIMITE_PARA_FACETAS };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (isOffer) params.isOffer = 'true';
      if (searchQuery) params.search = searchQuery;
      const data = await getProducts(params);
      const items: Product[] = Array.isArray(data) ? data : (data as { items?: Product[] })?.items ?? [];
      setProducts(items);
    } catch {
      setProducts([]);
    }
  }, [selectedCategory, selectedBrand, isOffer, searchQuery]);

  useEffect(() => { load(); }, [load]);

  const weights = [...new Set(products.flatMap((p) => [
    ...(p.hasWeight && p.weight != null ? [`${p.weight} ${p.weightUnit || ''}`.trim()] : []),
    ...(p.variants?.filter((v) => p.hasWeight && v.active && v.weight != null).map((v) => `${v.weight} ${v.weightUnit || ''}`.trim()) || []),
  ]))];

  return {
    sizes: valoresUnicos(products, 'size', 'hasSize'),
    colors: valoresUnicos(products, 'color', 'hasColor'),
    weights,
    genders: [...new Set(products.map((p) => p.gender).filter((g): g is string => !!g))],
  };
}
