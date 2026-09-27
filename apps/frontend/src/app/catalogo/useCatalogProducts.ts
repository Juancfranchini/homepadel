'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories, getBrands } from '@/lib/api';
import { Product, Category, Brand } from '@/types';

const ITEMS_PER_PAGE = 12;

interface Filters {
  currentPage: number;
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  searchQuery: string;
  selectedSize: string;
  selectedColor: string;
  selectedWeight: string;
  selectedShape: string;
  selectedGender: string;
  selectedLevel: string;
  minPrice: number | null;
  maxPrice: number | null;
  currentSort: string;
}

export function useCatalogProducts(filters: Filters) {
  const { currentPage, selectedCategory, selectedBrand, isOffer, searchQuery, selectedSize, selectedColor, selectedWeight, selectedShape, selectedGender, selectedLevel, minPrice, maxPrice, currentSort } = filters;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brs]) => {
        setCategories(Array.isArray(cats) ? cats : (cats as any)?.data ?? []);
        setBrands(Array.isArray(brs) ? brs : (brs as any)?.data ?? []);
      }).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // El orden viaja a la API: ordenar del lado del navegador solo reacomodaría
      // los doce productos de la página visible.
      const params: Record<string, unknown> = { page: currentPage, limit: ITEMS_PER_PAGE, sort: currentSort };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (isOffer) params.isOffer = 'true';
      if (searchQuery) params.search = searchQuery;
      if (selectedSize) params.size = selectedSize;
      if (selectedColor) params.color = selectedColor;
      if (selectedShape) params.shape = selectedShape;
      if (selectedGender) params.gender = selectedGender;
      if (selectedLevel) params.level = selectedLevel;
      if (minPrice != null) params.minPrice = minPrice;
      if (maxPrice != null) params.maxPrice = maxPrice;
      if (selectedWeight) {
        const [weightValue, unit] = selectedWeight.split(' ');
        params.weight = weightValue;
        if (unit) params.weightUnit = unit;
      }
      const data = await getProducts(params);
      const items: Product[] = Array.isArray(data) ? data : (data as any)?.items ?? [];
      const pages = (data as any)?.pages ?? Math.ceil(((data as any)?.total ?? 0) / ITEMS_PER_PAGE);
      setProducts(items);
      setTotalPages(pages);
      setTotalCount((data as any)?.total ?? items.length);
    } catch { setProducts([]); setTotalPages(1); setTotalCount(0); setError(true); }
    finally { setLoading(false); }
  }, [currentPage, selectedCategory, selectedBrand, isOffer, searchQuery, selectedSize, selectedColor, selectedWeight, selectedShape, selectedGender, selectedLevel, minPrice, maxPrice, currentSort]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return { products, categories, brands, loading, error, retry: loadProducts, totalPages, totalCount };
}
