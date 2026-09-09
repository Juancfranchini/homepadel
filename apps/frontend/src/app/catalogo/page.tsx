'use client';

import { useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useCatalogPage } from './useCatalogPage';
import CatalogHeader from './components/CatalogHeader';
import CatalogChips from './components/CatalogChips';
import CatalogSidebar from './components/CatalogSidebar';
import CatalogGrid from './components/CatalogGrid';
import CatalogList from './components/CatalogList';
import CatalogPagination from './components/CatalogPagination';
import CatalogEmpty from './components/CatalogEmpty';
import CatalogError from './components/CatalogError';
import CatalogSkeleton from './components/CatalogSkeleton';
import CatalogMobileSidebar from './components/CatalogMobileSidebar';

export default function CatálogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050606] flex items-center justify-center">
        <p className="text-[#C7C7C0] text-sm">Cargando catálogo...</p>
      </div>
    }>
      <CatálogoContent />
    </Suspense>
  );
}

function CatálogoContent() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const addCatalogItem = useCallback((product: Product) => {
    if (product.variants?.some((variant) => variant.active && !variant.isDefault) ||
        product.hasSize || product.hasColor || product.hasDimensions || product.hasWeight) {
      router.push('/producto/' + product.slug);
      return;
    }
    addItem(product);
  }, [addItem, router]);

  const {
    products, loading, error, retry, totalPages, totalCount, currentPage, sidebarOpen, setSidebarOpen,
    searchInput, setSearchInput, viewMode,
    hasFilters, activeChips, pageTitle, clearFilters, handleSearch, setParam,
    sidebarProps,
  } = useCatalogPage();

  return (
    <div className="min-h-screen bg-waves">
      <CatalogHeader
        pageTitle={pageTitle}
        loading={loading}
        totalCount={totalCount}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearch}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block">
            <CatalogSidebar {...sidebarProps} />
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
              error ? <CatalogError onRetry={retry} /> :
              products.length === 0 ? <CatalogEmpty hasFilters={hasFilters} onClear={clearFilters} /> :
                (viewMode === 'grid' ?
                  <CatalogGrid products={products} onAddToCart={addCatalogItem} />
                :
                  <CatalogList products={products} onAddToCart={addCatalogItem} />
                )
            }

            <CatalogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setParam('page', String(p))} />
          </div>
        </div>
      </div>

      <CatalogMobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} sidebarProps={sidebarProps} />
    </div>
  );
}
