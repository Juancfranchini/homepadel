'use client';
// Página de catálogo de productos — dark mode premium
// Sidebar de filtros (categorías, marcas, oferta) + grid de productos
// Filtros sincronizados con query params de URL

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, Filter, Search, ChevronDown } from 'lucide-react';
import { getProducts, getCategories, getBrands } from '@/lib/api';
import { Product, Category, Brand } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { useCartStore } from '@/store/cartStore';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Novedades' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc',   label: 'Nombre A-Z' },
];

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-[#A1A1AA] text-sm">Cargando catálogo...</p>
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  );
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [brands,      setBrands]      = useState<Brand[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // ── Filtros desde URL ────────────────────────────────────────────────────
  const currentPage       = Number(searchParams.get('page') || '1');
  const currentSort       = searchParams.get('sort') || 'newest';
  const selectedCategory  = searchParams.get('categoria') || '';      // slug único
  const selectedBrand     = searchParams.get('marca') || '';          // slug único
  const isOffer           = searchParams.get('oferta') === 'true';
  const searchQuery       = searchParams.get('q') || '';

  // Sync searchInput con URL
  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  // ── Carga categorías y marcas para los filtros ───────────────────────────
  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brs]) => {
        const catsArr = Array.isArray(cats) ? cats : (cats as any)?.data ?? [];
        const brsArr  = Array.isArray(brs)  ? brs  : (brs as any)?.data  ?? [];
        setCategories(catsArr);
        setBrands(brsArr);
      })
      .catch(() => {
        // Si falla la API, mantener arrays vacíos (sin mocks)
      });
  }, []);

  // ── Carga productos con filtros actuales ─────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // IMPORTANTE: los parámetros de URL usan "categoria"/"marca"
      // pero la API del backend espera "category"/"brand"
      const params: Record<string, unknown> = {
        page:  currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand)    params.brand    = selectedBrand;
      if (isOffer)          params.isOffer  = 'true';
      if (searchQuery)      params.search   = searchQuery;

      const data = await getProducts(params);

      // Backend devuelve { items, total, page, limit, pages }
      const items: Product[] = Array.isArray(data) ? data : (data as any)?.items ?? [];
      const pages: number    = (data as any)?.pages ?? Math.ceil(((data as any)?.total ?? 0) / ITEMS_PER_PAGE);

      setProducts(items);
      setTotalPages(pages);
      setTotalCount((data as any)?.total ?? items.length);
    } catch {
      setProducts([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSort, selectedCategory, selectedBrand, isOffer, searchQuery]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Helpers de URL ───────────────────────────────────────────────────────
  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    router.push(`/catalogo?${params.toString()}`);
  };

  const clearFilters = () => router.push('/catalogo');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('q', searchInput.trim() || null);
  };

  const hasFilters = !!selectedCategory || !!selectedBrand || isOffer || !!searchQuery;

  // ── Chips de filtros activos ─────────────────────────────────────────────
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (isOffer)          activeChips.push({ label: 'Ofertas', onRemove: () => setParam('oferta', null) });
  if (selectedCategory) activeChips.push({ label: selectedCategory, onRemove: () => setParam('categoria', null) });
  if (selectedBrand)    activeChips.push({ label: selectedBrand, onRemove: () => setParam('marca', null) });
  if (searchQuery)      activeChips.push({ label: `"${searchQuery}"`, onRemove: () => setParam('q', null) });

  // ── Título de la sección ─────────────────────────────────────────────────
  const pageTitle = isOffer ? 'Ofertas' : selectedCategory
    ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
    : 'Catálogo';

  return (
    <div className="min-h-screen bg-[#0A0A0A]">

      {/* ── Header / breadcrumb ────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.06] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-[11px] text-[#A1A1AA] mb-1">
            Inicio{' '}
            <span className="mx-1 text-white/20">/</span>
            <span className="text-white">{pageTitle}</span>
          </p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              {pageTitle}
              {!loading && <span className="ml-3 text-sm font-normal text-[#A1A1AA] normal-case">{totalCount} productos</span>}
            </h1>

            {/* Buscador */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-56 bg-[#121212] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-[#D4FF00] text-[#111] rounded-lg text-xs font-black uppercase tracking-wide hover:bg-white transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-56 flex-none">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#D4FF00]" />
                  Filtros
                </h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                  >
                    <X size={11} /> Limpiar
                  </button>
                )}
              </div>

              {/* Buscador mobile */}
              <form onSubmit={handleSearch} className="mb-5 lg:hidden">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                </div>
              </form>

              {/* Ofertas */}
              <div className="mb-5 pb-5 border-b border-white/[0.06]">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isOffer ? 'bg-[#D4FF00] border-[#D4FF00]' : 'border-white/20 group-hover:border-white/40'}`}>
                    {isOffer && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    <input type="checkbox" checked={isOffer} onChange={() => setParam('oferta', isOffer ? null : 'true')} className="sr-only" />
                  </div>
                  <span className={`text-sm font-semibold ${isOffer ? 'text-[#D4FF00]' : 'text-white/70 group-hover:text-white'} transition-colors`}>
                    Solo ofertas
                  </span>
                </label>
              </div>

              {/* Categorías */}
              {categories.length > 0 && (
                <div className="mb-5 pb-5 border-b border-white/[0.06]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A1A1AA] mb-3">
                    Categorías
                  </h3>
                  <ul className="space-y-2">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex-none flex items-center justify-center transition-colors ${selectedCategory === cat.slug ? 'bg-[#D4FF00] border-[#D4FF00]' : 'border-white/20 group-hover:border-white/40'}`}>
                            {selectedCategory === cat.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            <input
                              type="checkbox"
                              checked={selectedCategory === cat.slug}
                              onChange={() => setParam('categoria', selectedCategory === cat.slug ? null : cat.slug)}
                              className="sr-only"
                            />
                          </div>
                          <span className={`text-sm ${selectedCategory === cat.slug ? 'text-white font-semibold' : 'text-white/60 group-hover:text-white'} transition-colors truncate`}>
                            {cat.name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Marcas */}
              {brands.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A1A1AA] mb-3">
                    Marcas
                  </h3>
                  <ul className="space-y-2">
                    {brands.map((brand) => (
                      <li key={brand.id}>
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex-none flex items-center justify-center transition-colors ${selectedBrand === brand.slug ? 'bg-[#D4FF00] border-[#D4FF00]' : 'border-white/20 group-hover:border-white/40'}`}>
                            {selectedBrand === brand.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            <input
                              type="checkbox"
                              checked={selectedBrand === brand.slug}
                              onChange={() => setParam('marca', selectedBrand === brand.slug ? null : brand.slug)}
                              className="sr-only"
                            />
                          </div>
                          <span className={`text-sm ${selectedBrand === brand.slug ? 'text-white font-semibold' : 'text-white/60 group-hover:text-white'} transition-colors truncate`}>
                            {brand.name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {/* ── Contenido principal ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar: filtros móvil + ordenamiento + chips */}
            <div className="flex items-center justify-between mb-4 gap-3">
              {/* Botón filtros mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-[#111] border border-white/[0.08] rounded-lg px-4 py-2 text-sm font-medium text-white hover:border-white/20 transition-colors"
              >
                <Filter size={15} />
                Filtros
                {hasFilters && (
                  <span className="w-5 h-5 bg-[#D4FF00] text-[#111] rounded-full text-[10px] font-black flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </button>

              {/* Ordenamiento */}
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-[#A1A1AA] hidden sm:block">Ordenar:</label>
                <div className="relative">
                  <select
                    value={currentSort}
                    onChange={(e) => setParam('sort', e.target.value)}
                    className="appearance-none bg-[#111] border border-white/[0.08] text-white rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-white/20 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#111]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Chips de filtros activos */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="flex items-center gap-1.5 bg-[#D4FF00]/10 border border-[#D4FF00]/20 text-[#D4FF00] text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {chip.label}
                    <button onClick={chip.onRemove} className="hover:opacity-70 transition-opacity">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#A1A1AA] hover:text-white transition-colors px-2"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* Grid de productos */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div key={i} className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-white/[0.04]" />
                    <div className="p-4 space-y-2.5">
                      <div className="h-2.5 bg-white/[0.04] rounded w-1/3" />
                      <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                      <div className="h-5 bg-white/[0.04] rounded w-1/2" />
                      <div className="h-9 bg-white/[0.04] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-5xl mb-4">🎾</p>
                <p className="text-white font-bold text-lg mb-1">Sin resultados</p>
                <p className="text-[#A1A1AA] text-sm mb-6">
                  {hasFilters ? 'Probá con otros filtros o ampliá la búsqueda.' : 'No hay productos disponibles por el momento.'}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="bg-[#D4FF00] text-[#111] px-6 py-2.5 rounded-xl text-sm font-black hover:bg-white transition-colors"
                  >
                    Ver todos los productos
                  </button>
                )}
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
                  onClick={() => setParam('page', String(currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-white/[0.08] text-white text-sm font-medium disabled:opacity-30 hover:border-white/20 transition-colors"
                >
                  ← Anterior
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setParam('page', String(page))}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                        page === currentPage
                          ? 'bg-[#D4FF00] text-[#111]'
                          : 'border border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setParam('page', String(currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-white/[0.08] text-white text-sm font-medium disabled:opacity-30 hover:border-white/20 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sidebar móvil (overlay) ────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d0d0d] border-r border-white/[0.08] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-sm uppercase tracking-widest">Filtros</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Buscador */}
            <form onSubmit={(e) => { handleSearch(e); setSidebarOpen(false); }} className="mb-5">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full bg-[#121212] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </form>

            {/* Ofertas */}
            <div className="mb-5 pb-5 border-b border-white/[0.06]">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isOffer ? 'bg-[#D4FF00] border-[#D4FF00]' : 'border-white/20'}`}>
                  {isOffer && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  <input type="checkbox" checked={isOffer} onChange={() => { setParam('oferta', isOffer ? null : 'true'); setSidebarOpen(false); }} className="sr-only" />
                </div>
                <span className={`text-sm font-semibold ${isOffer ? 'text-[#D4FF00]' : 'text-white'}`}>Solo ofertas</span>
              </label>
            </div>

            {/* Categorías */}
            {categories.length > 0 && (
              <div className="mb-5 pb-5 border-b border-white/[0.06]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A1A1AA] mb-3">Categorías</h3>
                <ul className="space-y-3">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex-none flex items-center justify-center ${selectedCategory === cat.slug ? 'bg-[#D4FF00] border-[#D4FF00]' : 'border-white/20'}`}>
                          {selectedCategory === cat.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          <input type="checkbox" checked={selectedCategory === cat.slug} onChange={() => { setParam('categoria', selectedCategory === cat.slug ? null : cat.slug); setSidebarOpen(false); }} className="sr-only" />
                        </div>
                        <span className={`text-sm ${selectedCategory === cat.slug ? 'text-white font-semibold' : 'text-white/70'}`}>{cat.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Marcas */}
            {brands.length > 0 && (
              <div className="mb-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A1A1AA] mb-3">Marcas</h3>
                <ul className="space-y-3">
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex-none flex items-center justify-center ${selectedBrand === brand.slug ? 'bg-[#D4FF00] border-[#D4FF00]' : 'border-white/20'}`}>
                          {selectedBrand === brand.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          <input type="checkbox" checked={selectedBrand === brand.slug} onChange={() => { setParam('marca', selectedBrand === brand.slug ? null : brand.slug); setSidebarOpen(false); }} className="sr-only" />
                        </div>
                        <span className={`text-sm ${selectedBrand === brand.slug ? 'text-white font-semibold' : 'text-white/70'}`}>{brand.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasFilters && (
              <button
                onClick={() => { clearFilters(); setSidebarOpen(false); }}
                className="w-full py-3 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-colors"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
