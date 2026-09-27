'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

const ETIQUETA_FORMATO: Record<string, string> = { Lagrima: 'Lágrima', Hibrido: 'Híbrido' };
export const etiquetaFormato = (valor: string) => ETIQUETA_FORMATO[valor] ?? valor;

function precioDeParam(valor: string | null): number | null {
  if (!valor) return null;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function textoRangoPrecio(min: number | null, max: number | null): string {
  if (min != null && max != null) return formatPrice(min) + ' – ' + formatPrice(max);
  if (min != null) return 'desde ' + formatPrice(min);
  return 'hasta ' + formatPrice(max as number);
}

export function useCatalogFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get('page') || '1');
  const currentSort = searchParams.get('sort') || 'newest';
  const selectedCategory = searchParams.get('categoria') || '';
  const selectedBrand = searchParams.get('marca') || '';
  const isOffer = searchParams.get('oferta') === 'true';
  const searchQuery = searchParams.get('q') || '';
  const selectedSize = searchParams.get('talle') || '';
  const selectedColor = searchParams.get('color') || '';
  const selectedWeight = searchParams.get('peso') || '';
  const selectedShape = searchParams.get('formato') || '';
  const selectedGender = searchParams.get('genero') || '';
  const selectedLevel = searchParams.get('nivel') || '';
  const minPrice = precioDeParam(searchParams.get('desde'));
  const maxPrice = precioDeParam(searchParams.get('hasta'));

  // Varios a la vez en un solo cambio de URL: llamar dos veces a setParam
  // (desde y hasta) hacía que el segundo pisara al primero.
  const setParams = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    for (const [key, value] of Object.entries(cambios)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    router.push('/catalogo?' + params.toString());
  };
  const setParam = (key: string, value: string | null) => setParams({ [key]: value });

  const clearFilters = () => router.push('/catalogo');
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

  const pageTitle = isOffer ? 'Ofertas' : selectedCategory
    ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Catálogo';

  return {
    currentPage, currentSort, selectedCategory, selectedBrand, isOffer, searchQuery,
    selectedSize, selectedColor, selectedWeight, selectedShape, selectedGender, selectedLevel, minPrice, maxPrice,
    setParam, setParams, clearFilters, hasFilters, activeChips, pageTitle,
  };
}
