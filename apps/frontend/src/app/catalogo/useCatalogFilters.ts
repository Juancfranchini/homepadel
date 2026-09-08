'use client';

import { useSearchParams, useRouter } from 'next/navigation';

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

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    router.push('/catalogo?' + params.toString());
  };

  const clearFilters = () => router.push('/catalogo');
  const hasFilters = !!selectedCategory || !!selectedBrand || isOffer || !!searchQuery || !!selectedSize || !!selectedColor || !!selectedWeight;

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (isOffer) activeChips.push({ label: 'Ofertas', onRemove: () => setParam('oferta', null) });
  if (selectedCategory) activeChips.push({ label: selectedCategory, onRemove: () => setParam('categoria', null) });
  if (selectedBrand) activeChips.push({ label: selectedBrand, onRemove: () => setParam('marca', null) });
  if (selectedSize) activeChips.push({ label: 'Talle: ' + selectedSize, onRemove: () => setParam('talle', null) });
  if (selectedColor) activeChips.push({ label: 'Color: ' + selectedColor, onRemove: () => setParam('color', null) });
  if (selectedWeight) activeChips.push({ label: 'Peso: ' + selectedWeight, onRemove: () => setParam('peso', null) });
  if (searchQuery) activeChips.push({ label: '"' + searchQuery + '"', onRemove: () => setParam('q', null) });

  const pageTitle = isOffer ? 'Ofertas' : selectedCategory
    ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Catálogo';

  return {
    currentPage, currentSort, selectedCategory, selectedBrand, isOffer, searchQuery,
    selectedSize, selectedColor, selectedWeight,
    setParam, clearFilters, hasFilters, activeChips, pageTitle,
  };
}
