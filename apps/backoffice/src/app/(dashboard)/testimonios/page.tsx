'use client';

import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import SearchBar from './components/SearchBar';
import AdvancedSearchModal from './components/AdvancedSearchModal';
import TestimoniosTable from './components/TestimoniosTable';
import TestimoniosCards from './components/TestimoniosCards';
import TestimonialFormModal from './components/TestimonialFormModal';
import TestimonialDetailModal from './components/TestimonialDetailModal';
import { useTestimonios } from './useTestimonios';

export default function TestimoniosPage() {
  const {
    form, loading, modalOpen, setModalOpen, detailItem, setDetailItem, editItem, deleteTarget, setDeleteTarget,
    deleting, saving, search, setSearch, advancedOpen, setAdvancedOpen, advancedFilters, setAdvancedFilters, sortField,
    safeCurrentPage, setCurrentPage, totalPages, openCreate, openEdit, onSubmit, handleDelete, toggleActive,
    handleSort, filtered, paginated,
  } = useTestimonios();
  const { register, handleSubmit, formState: { errors } } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} registros</p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
          <div className="flex-1 min-w-0">
            <SearchBar value={search} onChange={setSearch} onAdvancedSearch={() => setAdvancedOpen(true)} hasAdvancedFilters={advancedFilters !== null} onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); setCurrentPage(1); }} />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors shrink-0">
            <Plus className="w-4 h-4" />Nuevo
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No se encontraron testimonios</p>
        </div>
      ) : (
        <>
          <TestimoniosTable testimonials={paginated} sortField={sortField} onSort={handleSort} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} onDetail={setDetailItem} />
          <TestimoniosCards testimonials={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} onDetail={setDetailItem} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))} disabled={safeCurrentPage === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">Anterior</button>
              <span className="text-sm text-gray-500">Pagina {safeCurrentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))} disabled={safeCurrentPage === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">Siguiente</button>
            </div>
          )}
        </>
      )}

      <TestimonialFormModal isOpen={modalOpen} editItem={editItem} register={register} errors={errors} saving={saving} onClose={() => setModalOpen(false)} onSubmit={handleSubmit(onSubmit)} />

      <TestimonialDetailModal item={detailItem} onClose={() => setDetailItem(null)} />

      {advancedOpen && (
        <AdvancedSearchModal
          isOpen={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); setCurrentPage(1); }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar testimonio"
        description={'Eliminar el testimonio de ' + (deleteTarget?.name || '') + '?'}
        isLoading={deleting}
      />
    </div>
  );
}
