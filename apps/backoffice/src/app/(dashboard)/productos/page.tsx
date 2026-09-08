'use client';

import { Plus } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import ProductSearchBar from './components/ProductSearchBar';
import ProductAdvancedSearchModal from './components/ProductAdvancedSearchModal';
import ProductDetailModal from './components/ProductDetailModal';
import ProductForm from './components/ProductForm';
import ProductsTable from './components/ProductsTable';
import ProductsCards from './components/ProductsCards';
import { useProductosPage } from './useProductosPage';

export default function ProductosPage() {
  const {
    categories, brands, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget,
    detailItem, setDetailItem, deleting, saving, search, setSearch, advancedOpen, setAdvancedOpen,
    advancedFilters, setAdvancedFilters, sortField, currentPage, setCurrentPage,
    openCreate, openEdit, handleSave, toggleFeatured, toggleActive, handleDelete, toggleSort,
    filtered, totalPages, paginated, defaultFormValues,
  } = useProductosPage();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">{filtered.length} registros</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
          <div className="flex-1 min-w-0">
            <ProductSearchBar value={search} onChange={setSearch} onAdvancedSearch={() => setAdvancedOpen(true)}
              hasAdvancedFilters={advancedFilters !== null} onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); }} />
          </div>
          <button onClick={openCreate} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" />
            <span>Nuevo producto</span>
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron productos</p></div>
      ) : (
        <div>
          <ProductsTable products={paginated} sortField={sortField} onSort={toggleSort} onToggleFeatured={toggleFeatured} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} onDetail={setDetailItem} />
          <ProductsCards products={paginated} onToggleFeatured={toggleFeatured} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}

      {detailItem && <ProductDetailModal product={detailItem} onClose={() => setDetailItem(null)} />}

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar producto' : 'Nuevo producto'} size="xl">
          <ProductForm
            key={editItem?.id || 'nuevo'}
            defaultValues={defaultFormValues}
            onSave={handleSave}
            onCancel={() => setModalOpen(false)}
            saving={saving}
            categories={categories}
            brands={brands}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        description={'Eliminar "' + (deleteTarget?.name || '') + '"? Esta accion no se puede deshacer.'}
        isLoading={deleting}
      />

      {advancedOpen && (
        <ProductAdvancedSearchModal
          isOpen={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }}
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  );
}
