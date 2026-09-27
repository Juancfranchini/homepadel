'use client';

import { useState, useEffect } from 'react';
import { useCatalogFilters } from './useCatalogFilters';
import { useCatalogTaxonomy } from './useCatalogTaxonomy';
import { useCatalogFacets } from './useCatalogFacets';
import type { CatalogResult } from './getCatalogData';

/** @param result Listado que armó el servidor para la URL actual. */
export function useCatalogPage(result: CatalogResult) {
  const filters = useCatalogFilters();
  const {
    currentPage, currentSort, selectedCategory, selectedBrand, isOffer, searchQuery,
    selectedSize, selectedColor, selectedWeight, selectedShape, selectedGender, selectedLevel, minPrice, maxPrice,
    setParam, setParams, clearFilters, refresh, isPending, hasFilters, activeChips, pageTitle,
  } = filters;

  const { categories, brands } = useCatalogTaxonomy();
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
    onCategoryChange: (slug: string | null) => setParam('categoria', slug),
    onBrandChange: (slug: string | null) => setParam('marca', slug),
    onOfferChange: (v: boolean) => setParam('oferta', v ? 'true' : null),
    onClear: clearFilters, hasFilters,
    sizes, colors, weights, genders, shapes, levels,
    selectedSize, selectedColor, selectedWeight, selectedLevel, minPrice, maxPrice,
    onLevelChange: (v: string | null) => setParam('nivel', v),
    onPriceChange: (min: number | null, max: number | null) =>
      setParams({ desde: min != null ? String(min) : null, hasta: max != null ? String(max) : null }),
    onSizeChange: (v: string | null) => setParam('talle', v),
    onColorChange: (v: string | null) => setParam('color', v),
    onWeightChange: (v: string | null) => setParam('peso', v),
    selectedShape, selectedGender,
    onShapeChange: (v: string | null) => setParam('formato', v),
    onGenderChange: (v: string | null) => setParam('genero', v),
  };

  return {
    products, loading, error, retry: refresh, totalPages, totalCount, currentPage, sidebarOpen, setSidebarOpen,
    searchInput, setSearchInput, viewMode,
    hasFilters, activeChips, pageTitle, clearFilters, handleSearch, setParam,
    sidebarProps,
  };
}
