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
}

export function useCatalogProducts(filters: Filters) {
  const { currentPage, selectedCategory, selectedBrand, isOffer, searchQuery, selectedSize, selectedColor, selectedWeight } = filters;

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
      const params: Record<string, unknown> = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (isOffer) params.isOffer = 'true';
      if (searchQuery) params.search = searchQuery;
      if (selectedSize) params.size = selectedSize;
      if (selectedColor) params.color = selectedColor;
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
  }, [currentPage, selectedCategory, selectedBrand, isOffer, searchQuery, selectedSize, selectedColor, selectedWeight]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const sizes = [...new Set(products.flatMap((p) => [
    ...(p.hasSize && p.size ? [p.size] : []),
    ...(p.variants?.filter((v) => p.hasSize && v.active && v.size).map((v) => v.size) || []),
  ]))];
  const colors = [...new Set(products.flatMap((p) => [
    ...(p.hasColor && p.color ? [p.color] : []),
    ...(p.variants?.filter((v) => p.hasColor && v.active && v.color).map((v) => v.color as string) || []),
  ]))];
  const weights = [...new Set(products.flatMap((p) => [
    ...(p.hasWeight && p.weight != null ? [`${p.weight} ${p.weightUnit || ''}`.trim()] : []),
    ...(p.variants?.filter((v) => p.hasWeight && v.active && v.weight != null).map((v) => `${v.weight} ${v.weightUnit || ''}`.trim()) || []),
  ]))];

  return { products, categories, brands, loading, error, retry: loadProducts, totalPages, totalCount, sizes, colors, weights };
}
