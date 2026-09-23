'use client';

import { useState, useEffect } from 'react';
import { useCatalogFilters } from './useCatalogFilters';
import { useCatalogProducts } from './useCatalogProducts';

export function useCatalogPage() {
  const filters = useCatalogFilters();
  const {
    currentPage, currentSort, selectedCategory, selectedBrand, isOffer, searchQuery,
    selectedSize, selectedColor, selectedWeight, selectedShape, selectedGender,
    setParam, clearFilters, hasFilters, activeChips, pageTitle,
  } = filters;

  const { products, categories, brands, loading, error, retry, totalPages, totalCount, sizes, colors, weights, genders } = useCatalogProducts({
    currentPage, selectedCategory, selectedBrand, isOffer, searchQuery, selectedSize, selectedColor, selectedWeight, selectedShape, selectedGender, currentSort,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
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
    sizes, colors, weights, genders,
    selectedSize, selectedColor, selectedWeight,
    onSizeChange: (v: string | null) => setParam('talle', v),
    onColorChange: (v: string | null) => setParam('color', v),
    onWeightChange: (v: string | null) => setParam('peso', v),
    selectedShape, selectedGender,
    onShapeChange: (v: string | null) => setParam('formato', v),
    onGenderChange: (v: string | null) => setParam('genero', v),
  };

  return {
    products, loading, error, retry, totalPages, totalCount, currentPage, sidebarOpen, setSidebarOpen,
    searchInput, setSearchInput, viewMode,
    hasFilters, activeChips, pageTitle, clearFilters, handleSearch, setParam,
    sidebarProps,
  };
}
