'use client';

import { Plus, Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import BeneficiosTable from './components/BeneficiosTable';
import BeneficiosCards from './components/BeneficiosCards';
import BenefitFormModal from './components/BenefitFormModal';
import { useBeneficios } from './useBeneficios';

export default function BeneficiosPage() {
  const {
    form, loading, search, setSearch, setPage, modalOpen, setModalOpen, editItem, deleteTarget,
    setDeleteTarget, deleting, saving, filtered, totalPages, currentPage, paginated,
    openCreate, openEdit, onSubmit, toggleActive, handleDelete,
  } = useBeneficios();
  const { register, handleSubmit, watch, formState: { errors } } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} registros</p>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0 lg:max-w-md">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar beneficios..."
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors shrink-0">
            <Plus className="w-4 h-4" />Nuevo
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron beneficios</p></div>
      ) : (
        <>
          <BeneficiosTable benefits={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
          <BeneficiosCards benefits={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">Anterior</button>
              <span className="text-sm text-gray-500">Pagina {currentPage} de {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">Siguiente</button>
            </div>
          )}
        </>
      )}

      <BenefitFormModal isOpen={modalOpen} editItem={editItem} register={register} errors={errors} watchIcon={watch('icon')} saving={saving} onClose={() => setModalOpen(false)} onSubmit={handleSubmit(onSubmit)} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar beneficio" description={'Eliminar "' + (deleteTarget?.title || '') + '"?'} isLoading={deleting} />
    </div>
  );
}
