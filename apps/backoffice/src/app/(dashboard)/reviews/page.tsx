'use client';

import { Plus, HelpCircle } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import ReviewsSearchBar from './components/ReviewsSearchBar';
import ReviewsAdvancedSearchModal from './components/ReviewsAdvancedSearchModal';
import ReviewsTable from './components/ReviewsTable';
import ReviewsCards from './components/ReviewsCards';
import ReviewFormModal from './components/ReviewFormModal';
import { useReviews } from './useReviews';

export default function ReviewsPage() {
  const {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, advancedOpen, setAdvancedOpen, advancedFilters, setAdvancedFilters, sortField,
    currentPage, setCurrentPage, showInfoModal, setShowInfoModal, products, infoData,
    openCreate, openEdit, onSubmit, toggleActive, handleDelete, handleSort, filtered, totalPages, paginated,
  } = useReviews();
  const { register, handleSubmit, watch, formState: { errors } } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Resenas de productos</h1>
          <p className="text-gray-500 text-sm">{filtered.length} resenas</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
          <div className="flex-1 min-w-0">
            <ReviewsSearchBar value={search} onChange={setSearch} onAdvancedSearch={() => setAdvancedOpen(true)} hasAdvancedFilters={advancedFilters !== null} onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); }} />
          </div>
          <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-1.5 px-3 py-2 border border-[#C8FF00]/50 text-gray-600 rounded-lg font-semibold text-sm hover:bg-[#C8FF00]/10 hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors whitespace-nowrap shrink-0">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Info</span>
            <span className="sm:hidden">i</span>
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva resena</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron resenas</p></div>
      ) : (
        <div>
          <ReviewsTable reviews={paginated} sortField={sortField} onSort={handleSort} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
          <ReviewsCards reviews={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}

      <ReviewFormModal isOpen={modalOpen} editItem={editItem} products={products} register={register} errors={errors} watchRating={watch('rating')} saving={saving} onClose={() => setModalOpen(false)} onSubmit={handleSubmit(onSubmit)} />

      {showInfoModal && (
        <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title={infoData.title} size="md">
          <div className="p-4 sm:p-6">
            <p className="text-gray-600 text-sm leading-relaxed">{infoData.content || 'No hay informacion disponible.'}</p>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar resena"
        description={'Eliminar la resena de "' + (deleteTarget?.name || '') + '"? Esta accion no se puede deshacer.'}
        isLoading={deleting}
      />

      {advancedOpen && (
        <ReviewsAdvancedSearchModal
          isOpen={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          products={products}
          onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }}
        />
      )}
    </div>
  );
}
