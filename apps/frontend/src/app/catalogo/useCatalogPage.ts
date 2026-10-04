'use client';

import { useState, useEffect } from 'react';
import { useCatalogFilters } from './useCatalogFilters';
import { useCatalogTaxonomy } from './useCatalogTaxonomy';
import { useCatalogFacets } from './useCatalogFacets';
import { alternarValor } from './catalogQuery';
import type { CatalogResult } from './getCatalogData';

/** @param result Listado que armó el servidor para la URL actual. */
export function useCatalogPage(result: CatalogResult) {
  const { categories, brands } = useCatalogTaxonomy();
  const filters = useCatalogFilters({ categories, brands });
  const {
    currentPage, currentSort, selectedCategory, selectedBrand, isOffer, searchQuery,
    selectedSize, selectedColor, selectedWeight, selectedShape, selectedGender, selectedLevel, minPrice, maxPrice,
    setParam, setParams, clearFilters, refresh, isPending, hasFilters, activeChips, pageTitle,
  } = filters;

  const { products, totalPages, totalCount, error } = result;
  // Mientras el servidor arma el listado nuevo, el anterior ya no corresponde a los filtros elegidos.
  const loading = isPending;
  const { sizes, colors, weights, genders, shapes, levels } = useCatalogFacets({ selectedCategory, selectedBrand, isOffer, searchQuery });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setParam('q', searchInput.trim() || null); };

  const sidebarProps = {
    categories, brands, selectedCategory, selectedBrand, isOffer,
    viewMode, currentSort, onViewModeChange: setViewMode, onSortChange: (v: string) => setParam('sort', v),
    // Marca, categoría y los atributos de lista se tildan y destildan: se
    // pueden elegir varios a la vez. Antes cada clic reemplazaba al anterior.
    onCategoryChange: (slug: string | null) => setParam('categoria', slug ? alternarValor(selectedCategory, slug) : null),
    onBrandChange: (slug: string | null) => setParam('marca', slug ? alternarValor(selectedBrand, slug) : null),
    onOfferChange: (v: boolean) => setParam('oferta', v ? 'true' : null),
    onClear: clearFilters, hasFilters,
    sizes, colors, weights, genders, shapes, levels,
    selectedSize, selectedColor, selectedWeight, selectedLevel, minPrice, maxPrice,
    onLevelChange: (v: string | null) => setParam('nivel', v ? alternarValor(selectedLevel, v) : null),
    onPriceChange: (min: number | null, max: number | null) =>
      setParams({ desde: min != null ? String(min) : null, hasta: max != null ? String(max) : null }),
    onSizeChange: (v: string | null) => setParam('talle', v ? alternarValor(selectedSize, v) : null),
    onColorChange: (v: string | null) => setParam('color', v ? alternarValor(selectedColor, v) : null),
    onWeightChange: (v: string | null) => setParam('peso', v),
    selectedShape, selectedGender,
    onShapeChange: (v: string | null) => setParam('formato', v ? alternarValor(selectedShape, v) : null),
    onGenderChange: (v: string | null) => setParam('genero', v ? alternarValor(selectedGender, v) : null),
  };

  return {
    products, loading, error, retry: refresh, totalPages, totalCount, currentPage, sidebarOpen, setSidebarOpen,
    searchInput, setSearchInput, viewMode,
    hasFilters, activeChips, pageTitle, clearFilters, handleSearch, setParam,
    sidebarProps,
  };
}
