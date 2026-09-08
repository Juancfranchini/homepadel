'use client';

import { Plus, Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import PromotionsTable from './components/PromotionsTable';
import PromotionsCards from './components/PromotionsCards';
import PromotionFormModal from './components/PromotionFormModal';
import { usePromociones } from './usePromociones';

export default function PromociónesPage() {
  const {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, currentPage, setCurrentPage, openCreate, openEdit, onSubmit, toggleActive, handleDelete,
    filtered, totalPages, paginated,
  } = usePromociones();
  const { register, handleSubmit, formState: { errors } } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Promociónes</h1>
          <p className="text-gray-500 text-sm">{filtered.length} registros</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar promociones..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
              />
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva promoción</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron promociónes</p></div>
      ) : (
        <>
          <PromotionsTable promotions={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
          <PromotionsCards promotions={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      <PromotionFormModal isOpen={modalOpen} editItem={editItem} register={register} errors={errors} saving={saving} onClose={() => setModalOpen(false)} onSubmit={handleSubmit(onSubmit)} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar promoción" description={'Eliminar "' + (deleteTarget?.title || '') + '"?'} isLoading={deleting} />
    </div>
  );
}
