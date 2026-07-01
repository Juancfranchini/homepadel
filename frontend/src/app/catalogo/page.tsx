'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { getProducts, getCategories, getBrands } from '@/lib/api';
import { Product, Category, Brand } from '@/types';
import { useCartStore } from '@/store/cartStore';
import CatalogSearch from './components/CatalogSearch';
import CatalogChips from './components/CatalogChips';
import CatalogSidebar from './components/CatalogSidebar';
import CatalogGrid from './components/CatalogGrid';
import CatalogList from './components/CatalogList';
import CatalogPagination from './components/CatalogPagination';
import CatalogEmpty from './components/CatalogEmpty';
import CatalogSkeleton from './components/CatalogSkeleton';

const ITEMS_PER_PAGE = 12;

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050606] flex items-center justify-center">
        <p className="text-[#C7C7C0] text-sm">Cargando catalogo...</p>
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

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentPage = Number(searchParams.get('page') || '1');
  const currentSort = searchParams.get('sort') || 'newest';
  const selectedCategory = searchParams.get('categoria') || '';
  const selectedBrand = searchParams.get('marca') || '';
  const isOffer = searchParams.get('oferta') === 'true';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brs]) => {
        setCategories(Array.isArray(cats) ? cats : (cats as any)?.data ?? []);
        setBrands(Array.isArray(brs) ? brs : (brs as any)?.data ?? []);
      }).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (isOffer) params.isOffer = 'true';
      if (searchQuery) params.search = searchQuery;
      const data = await getProducts(params);
      const items: Product[] = Array.isArray(data) ? data : (data as any)?.items ?? [];
      const pages = (data as any)?.pages ?? Math.ceil(((data as any)?.total ?? 0) / ITEMS_PER_PAGE);
      setProducts(items);
      setTotalPages(pages);
      setTotalCount((data as any)?.total ?? items.length);
    } catch { setProducts([]); setTotalPages(1); setTotalCount(0); }
    finally { setLoading(false); }
  }, [currentPage, selectedCategory, selectedBrand, isOffer, searchQuery]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    router.push('/catalogo?' + params.toString());
  };

  const clearFilters = () => router.push('/catalogo');
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setParam('q', searchInput.trim() || null); };
  const hasFilters = !!selectedCategory || !!selectedBrand || isOffer || !!searchQuery;

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (isOffer) activeChips.push({ label: 'Ofertas', onRemove: () => setParam('oferta', null) });
  if (selectedCategory) activeChips.push({ label: selectedCategory, onRemove: () => setParam('categoria', null) });
  if (selectedBrand) activeChips.push({ label: selectedBrand, onRemove: () => setParam('marca', null) });
  if (searchQuery) activeChips.push({ label: '"' + searchQuery + '"', onRemove: () => setParam('q', null) });

  const pageTitle = isOffer ? 'Ofertas' : selectedCategory
    ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Catalogo';

  return (
    <div className="min-h-screen bg-waves">
      <div className="border-b border-[#0D0F0F] bg-[#050606]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <p className="text-[11px] text-[#8A8A85] mb-1">
            Inicio <span className="mx-1">/</span> <span className="text-[#F7F6F7]">{pageTitle}</span>
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-xl font-semibold uppercase tracking-tight text-[#F7F6F7]">
              {pageTitle}
              {!loading && <span className="ml-3 text-sm font-normal text-[#8A8A85] normal-case">{totalCount} productos</span>}
            </h1>
            <CatalogSearch value={searchInput} onChange={setSearchInput} onSubmit={handleSearch} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block">
            <CatalogSidebar
              categories={categories} brands={brands}
              selectedCategory={selectedCategory} selectedBrand={selectedBrand}
              isOffer={isOffer} totalCount={totalCount}
              viewMode={viewMode} currentSort={currentSort} onViewModeChange={setViewMode} onSortChange={(v) => setParam('sort', v)}
              onCategoryChange={(slug) => setParam('categoria', slug)}
              onBrandChange={(slug) => setParam('marca', slug)}
              onOfferChange={(v) => setParam('oferta', v ? 'true' : null)}
              onClear={clearFilters} hasFilters={hasFilters}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-[#0C0C0C] border border-[#0D0F0F] rounded-lg px-4 py-2 text-sm font-medium text-[#F7F6F7] hover:border-[#8A8A85] transition-colors">
                <Filter size={15} />Filtros
                {hasFilters && <span className="w-5 h-5 bg-[#B7D31A] text-[#050606] rounded-full text-[10px] font-bold flex items-center justify-center">{activeChips.length}</span>}
              </button>
              <p className="text-sm text-[#C7C7C0] hidden sm:block">{totalCount} productos</p>
              
            </div>

            <CatalogChips chips={activeChips} onClearAll={clearFilters} />

            {loading ? <CatalogSkeleton /> :
              products.length === 0 ? <CatalogEmpty hasFilters={hasFilters} onClear={clearFilters} /> :
                (viewMode === 'grid' ?
                  <CatalogGrid products={products} onAddToCart={(p) => addItem(p)} />
                :
                  <CatalogList products={products} onAddToCart={(p) => addItem(p)} />
                )
            }

            <CatalogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setParam('page', String(p))} />
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#050606] border-r border-[#0D0F0F] p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#F7F6F7] font-semibold text-xs uppercase tracking-widest">Filtros</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-[#8A8A85] hover:text-[#F7F6F7]"><X size={18} /></button>
            </div>
            <CatalogSidebar
              categories={categories} brands={brands}
              selectedCategory={selectedCategory} selectedBrand={selectedBrand}
              isOffer={isOffer} totalCount={totalCount}
              viewMode={viewMode} currentSort={currentSort} onViewModeChange={setViewMode} onSortChange={(v) => setParam('sort', v)}
              onCategoryChange={(slug) => setParam('categoria', slug)}
              onBrandChange={(slug) => setParam('marca', slug)}
              onOfferChange={(v) => setParam('oferta', v ? 'true' : null)}
              onClear={clearFilters} hasFilters={hasFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
}