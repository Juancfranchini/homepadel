'use client';

import { useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { parseCatalogFilters } from './catalogQuery';

const ETIQUETA_FORMATO: Record<string, string> = { Lagrima: 'Lágrima', Hibrido: 'Híbrido' };
export const etiquetaFormato = (valor: string) => ETIQUETA_FORMATO[valor] ?? valor;

function textoRangoPrecio(min: number | null, max: number | null): string {
  if (min != null && max != null) return formatPrice(min) + ' – ' + formatPrice(max);
  if (min != null) return 'desde ' + formatPrice(min);
  return 'hasta ' + formatPrice(max as number);
}

/**
 * Filtros del catálogo, leídos de la URL.
 *
 * Cambiar un filtro cambia la URL y el servidor vuelve a armar el listado
 * (ver page.tsx). La navegación va dentro de una transición: mientras el
 * servidor responde, `isPending` deja mostrar el esqueleto en vez de dejar
 * la grilla vieja como si nada hubiera pasado.
 */
export function useCatalogFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filters = parseCatalogFilters((clave) => searchParams.get(clave));
  const {
    selectedCategory, selectedBrand, isOffer, searchQuery, selectedSize, selectedColor,
    selectedWeight, selectedShape, selectedGender, selectedLevel, minPrice, maxPrice,
  } = filters;

  const navegar = (url: string) => startTransition(() => router.push(url));
  const refresh = () => startTransition(() => router.refresh());

  // Varios a la vez en un solo cambio de URL: llamar dos veces a setParam
  // (desde y hasta) hacía que el segundo pisara al primero.
  const setParams = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    for (const [key, value] of Object.entries(cambios)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    navegar('/catalogo?' + params.toString());
  };
  const setParam = (key: string, value: string | null) => setParams({ [key]: value });

  const clearFilters = () => navegar('/catalogo');
  const hasFilters = !!selectedCategory || !!selectedBrand || isOffer || !!searchQuery || !!selectedSize || !!selectedColor
    || !!selectedWeight || !!selectedShape || !!selectedGender || !!selectedLevel || minPrice != null || maxPrice != null;

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (isOffer) activeChips.push({ label: 'Ofertas', onRemove: () => setParam('oferta', null) });
  if (selectedCategory) activeChips.push({ label: selectedCategory, onRemove: () => setParam('categoria', null) });
  if (selectedBrand) activeChips.push({ label: selectedBrand, onRemove: () => setParam('marca', null) });
  if (selectedSize) activeChips.push({ label: 'Talle: ' + selectedSize, onRemove: () => setParam('talle', null) });
  if (selectedColor) activeChips.push({ label: 'Color: ' + selectedColor, onRemove: () => setParam('color', null) });
  if (selectedWeight) activeChips.push({ label: 'Peso: ' + selectedWeight, onRemove: () => setParam('peso', null) });
  if (selectedShape) activeChips.push({ label: 'Formato: ' + etiquetaFormato(selectedShape), onRemove: () => setParam('formato', null) });
  if (selectedGender) activeChips.push({ label: 'Género: ' + selectedGender, onRemove: () => setParam('genero', null) });
  if (selectedLevel) activeChips.push({ label: 'Nivel: ' + selectedLevel, onRemove: () => setParam('nivel', null) });
  if (minPrice != null || maxPrice != null) {
    activeChips.push({ label: 'Precio: ' + textoRangoPrecio(minPrice, maxPrice), onRemove: () => setParams({ desde: null, hasta: null }) });
  }
  if (searchQuery) activeChips.push({ label: '"' + searchQuery + '"', onRemove: () => setParam('q', null) });

  const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
  // Entrando desde "Hombre" o "Mujer" del menú, el título lo dice.
  const pageTitle = isOffer ? 'Ofertas' : selectedCategory ? capitalizar(selectedCategory)
    : selectedGender ? capitalizar(selectedGender) : 'Catálogo';

  return {
    ...filters,
    setParam, setParams, clearFilters, refresh, isPending, hasFilters, activeChips, pageTitle,
  };
}
