'use client';
// Página de catálogo de productos
// Sidebar de filtros (categorías, marcas, rango de precio) + grid de productos
// Paginación, ordenamiento, y sincronización con parámetros de URL

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X, Filter } from 'lucide-react';
import { getProducts, getCategories, getBrands } from '@/lib/api';
import { Product, Category, Brand } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { useCartStore } from '@/store/cartStore';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Novedades' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
];

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Cargando catálogo...</p></div>}>
      <CatalogoContent />
    </Suspense>
  );
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filtros desde URL
  const currentPage = Number(searchParams.get('page') || '1');
  const currentSort = searchParams.get('sort') || 'newest';
  const selectedCategories = searchParams.getAll('categoria');
  const selectedBrands = searchParams.getAll('marca');
  const isOffer = searchParams.get('oferta') === 'true';

  // Carga categorías y marcas para los filtros
  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brs]) => {
        setCategories(Array.isArray(cats) ? cats : cats?.data ?? MOCK_CATEGORIES);
        setBrands(Array.isArray(brs) ? brs : brs?.data ?? MOCK_BRANDS);
      })
      .catch(() => {
        setCategories(MOCK_CATEGORIES);
        setBrands(MOCK_BRANDS);
      });
  }, []);

  // Carga productos con filtros actuales
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: currentSort,
      };
      if (selectedCategories.length > 0) params.categoria = selectedCategories;
      if (selectedBrands.length > 0) params.marca = selectedBrands;
      if (isOffer) params.oferta = true;

      const data = await getProducts(params);
      const items = Array.isArray(data) ? data : data?.data ?? [];
      setProducts(items.length > 0 ? items : MOCK_PRODUCTS);
      setTotalPages(data?.totalPages ?? Math.ceil((data?.total ?? MOCK_PRODUCTS.length) / ITEMS_PER_PAGE));
    } catch {
      setProducts(MOCK_PRODUCTS);
      setTotalPages(Math.ceil(MOCK_PRODUCTS.length / ITEMS_PER_PAGE));
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSort, selectedCategories.join(), selectedBrands.join(), isOffer]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Actualiza un parámetro de URL y resetea la página
  const updateFilter = (key: string, value: string, multi = false) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (multi) {
      const current = params.getAll(key);
      if (current.includes(value)) {
        params.delete(key);
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
    } else {
      params.set(key, value);
    }

    router.push(`/catalogo?${params.toString()}`);
  };

  const clearFilters = () => router.push('/catalogo');

  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || isOffer;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Breadcrumb + título ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <p className="text-xs text-gray-400 mb-1">
            Inicio / <span className="text-gray-600">Catálogo</span>
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#111]">
              {isOffer ? 'Ofertas' : selectedCategories[0] ? selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1) : 'Catálogo'}
            </h1>
            <p className="text-gray-500 text-sm">{products.length} productos</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* ── Sidebar — filtros (desktop) ───────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-none">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Filtros
                </h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={12} />
                    Limpiar
                  </button>
                )}
              </div>

              {/* Ofertas */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOffer}
                    onChange={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (isOffer) params.delete('oferta');
                      else params.set('oferta', 'true');
                      params.set('page', '1');
                      router.push(`/catalogo?${params.toString()}`);
                    }}
                    className="w-4 h-4 accent-[#C8FF00]"
                  />
                  <span className="text-sm font-semibold text-[#C8FF00]">Solo ofertas</span>
                </label>
              </div>

              {/* Categorías */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-500 mb-3">
                  Categorías
                </h3>
                <ul className="space-y-2">
                  {(categories.length > 0 ? categories : MOCK_CATEGORIES).map((cat) => (
                    <li key={cat.id}>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => updateFilter('categoria', cat.slug, true)}
                          className="w-4 h-4 accent-[#111]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#111] transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Marcas */}
              <div className="mb-5">
                <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-500 mb-3">
                  Marcas
                </h3>
                <ul className="space-y-2">
                  {(brands.length > 0 ? brands : MOCK_BRANDS).map((brand) => (
                    <li key={brand.id}>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.slug)}
                          onChange={() => updateFilter('marca', brand.slug, true)}
                          className="w-4 h-4 accent-[#111]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#111] transition-colors">
                          {brand.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ── Contenido principal ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: filtros móvil + ordenamiento */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:border-gray-300 transition-colors"
              >
                <Filter size={16} />
                Filtros
                {hasFilters && (
                  <span className="w-5 h-5 bg-[#C8FF00] text-[#111] rounded-full text-xs font-black flex items-center justify-center">
                    {selectedCategories.length + selectedBrands.length + (isOffer ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-gray-500 hidden sm:block">Ordenar:</label>
                <div className="relative">
                  <select
                    value={currentSort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-gray-400 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Chips de filtros activos */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {isOffer && (
                  <span className="flex items-center gap-1 bg-[#C8FF00] text-[#111] text-xs font-bold px-3 py-1 rounded-full">
                    Ofertas
                    <button onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('oferta');
                      router.push(`/catalogo?${params.toString()}`);
                    }}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedCategories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    {cat}
                    <button onClick={() => updateFilter('categoria', cat, true)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {selectedBrands.map((brand) => (
                  <span key={brand} className="flex items-center gap-1 bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    {brand}
                    <button onClick={() => updateFilter('marca', brand, true)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Grid de productos */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🎾</p>
                <p className="text-gray-500 font-medium mb-2">No encontramos productos</p>
                <p className="text-gray-400 text-sm mb-6">Probá con otros filtros</p>
                <button
                  onClick={clearFilters}
                  className="bg-[#111] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#222] transition-colors"
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => addItem(p)}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => updateFilter('page', String(currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Anterior
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => updateFilter('page', String(page))}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                        page === currentPage
                          ? 'bg-[#111] text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => updateFilter('page', String(currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sidebar móvil (overlay) ──────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Filtros</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Mismos filtros que el sidebar desktop */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOffer}
                  onChange={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (isOffer) params.delete('oferta');
                    else params.set('oferta', 'true');
                    params.set('page', '1');
                    router.push(`/catalogo?${params.toString()}`);
                    setSidebarOpen(false);
                  }}
                  className="w-4 h-4 accent-[#C8FF00]"
                />
                <span className="font-semibold text-[#C8FF00]">Solo ofertas</span>
              </label>
            </div>

            <div className="mb-5 pb-5 border-b border-gray-100">
              <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-500 mb-3">
                Categorías
              </h3>
              <ul className="space-y-3">
                {MOCK_CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => {
                          updateFilter('categoria', cat.slug, true);
                          setSidebarOpen(false);
                        }}
                        className="w-4 h-4 accent-[#111]"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-500 mb-3">
                Marcas
              </h3>
              <ul className="space-y-3">
                {MOCK_BRANDS.map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.slug)}
                        onChange={() => {
                          updateFilter('marca', brand.slug, true);
                          setSidebarOpen(false);
                        }}
                        className="w-4 h-4 accent-[#111]"
                      />
                      <span className="text-sm">{brand.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {hasFilters && (
              <button
                onClick={() => { clearFilters(); setSidebarOpen(false); }}
                className="mt-6 w-full py-3 text-red-500 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Datos mock para desarrollo sin backend
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Paletas', slug: 'paletas' },
  { id: '2', name: 'Zapatillas', slug: 'zapatillas' },
  { id: '3', name: 'Indumentaria', slug: 'indumentaria' },
  { id: '4', name: 'Accesorios', slug: 'accesorios' },
];

const MOCK_BRANDS: Brand[] = [
  { id: '1', name: 'Babolat', slug: 'babolat' },
  { id: '2', name: 'Adidas', slug: 'adidas' },
  { id: '3', name: 'Bullpadel', slug: 'bullpadel' },
  { id: '4', name: 'Head', slug: 'head' },
  { id: '5', name: 'Wilson', slug: 'wilson' },
  { id: '6', name: 'Nox', slug: 'nox' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Paleta Babolat Viper Carbon', slug: 'paleta-babolat-viper-carbon', price: 85000, salePrice: 68000, sku: 'BAB-001', stock: 8, images: [], featured: true, category: MOCK_CATEGORIES[0], brand: MOCK_BRANDS[0] },
  { id: '2', name: 'Zapatillas Adidas Adizero Pro', slug: 'zapatillas-adidas-adizero', price: 62000, salePrice: 49600, sku: 'ADI-001', stock: 12, images: [], featured: true, category: MOCK_CATEGORIES[1], brand: MOCK_BRANDS[1] },
  { id: '3', name: 'Remera Bullpadel Performance', slug: 'remera-bullpadel-performance', price: 18000, sku: 'BUL-001', stock: 20, images: [], featured: false, category: MOCK_CATEGORIES[2], brand: MOCK_BRANDS[2] },
  { id: '4', name: 'Bolso Head Pro Tour', slug: 'bolso-head-pro-tour', price: 24000, salePrice: 19200, sku: 'HEA-001', stock: 6, images: [], featured: false, category: MOCK_CATEGORIES[3], brand: MOCK_BRANDS[3] },
  { id: '5', name: 'Paleta Head Alpha Pro', slug: 'paleta-head-alpha-pro', price: 72000, salePrice: 57600, sku: 'HEA-002', stock: 4, images: [], featured: true, category: MOCK_CATEGORIES[0], brand: MOCK_BRANDS[3] },
  { id: '6', name: 'Grips Wilson Pro x3', slug: 'grips-wilson-pro', price: 4500, sku: 'WIL-001', stock: 50, images: [], featured: false, category: MOCK_CATEGORIES[3], brand: MOCK_BRANDS[4] },
  { id: '7', name: 'Paleta Nox AT10 Luxury', slug: 'paleta-nox-at10', price: 95000, salePrice: 76000, sku: 'NOX-001', stock: 3, images: [], featured: true, category: MOCK_CATEGORIES[0], brand: MOCK_BRANDS[5] },
  { id: '8', name: 'Short Bullpadel Beker', slug: 'short-bullpadel-beker', price: 14000, sku: 'BUL-002', stock: 15, images: [], featured: false, category: MOCK_CATEGORIES[2], brand: MOCK_BRANDS[2] },
  { id: '9', name: 'Zapatillas Babolat Jet Premura', slug: 'zapatillas-babolat-jet', price: 58000, salePrice: 46400, sku: 'BAB-002', stock: 9, images: [], featured: false, category: MOCK_CATEGORIES[1], brand: MOCK_BRANDS[0] },
  { id: '10', name: 'Mochila Head Core 9R', slug: 'mochila-head-core', price: 32000, sku: 'HEA-003', stock: 7, images: [], featured: false, category: MOCK_CATEGORIES[3], brand: MOCK_BRANDS[3] },
  { id: '11', name: 'Paleta Wilson Carbon Force', slug: 'paleta-wilson-carbon', price: 78000, salePrice: 62400, sku: 'WIL-002', stock: 5, images: [], featured: true, category: MOCK_CATEGORIES[0], brand: MOCK_BRANDS[4] },
  { id: '12', name: 'Polera Adidas Club 3S', slug: 'polera-adidas-club', price: 16000, sku: 'ADI-002', stock: 18, images: [], featured: false, category: MOCK_CATEGORIES[2], brand: MOCK_BRANDS[1] },
];
