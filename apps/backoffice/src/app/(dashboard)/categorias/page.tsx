'use client';

import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import CategoriasTable from './components/CategoriasTable';
import CategoriasCards from './components/CategoriasCards';
import CategoryFormModal from './components/CategoryFormModal';
import { useCategorias } from './useCategorias';

export default function CategoriasPage() {
  const {
    form, categories, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    uploading, currentPage, setCurrentPage, totalPages, paginated, showCategoriesSection, loadingSection,
    handleToggleCategoriesSection, openCreate, openEdit, handleUpload, onSubmit, toggleActive, handleDelete,
  } = useCategorias();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva categoria</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No se encontraron categorias</p>
        </div>
      ) : (
        <div>
          <CategoriasTable
            categories={paginated}
            showCategoriesSection={showCategoriesSection}
            loadingSection={loadingSection}
            onToggleSection={handleToggleCategoriesSection}
            onToggleActive={toggleActive}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
          <CategoriasCards categories={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={modalOpen}
        editItem={editItem}
        imageUrl={watch('image')}
        isActive={watch('isActive')}
        uploading={uploading}
        register={register}
        errors={errors}
        setValue={setValue}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
        onSubmit={handleSubmit(onSubmit)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar categoria"
        description={'Eliminar "' + (deleteTarget?.name || '') + '"? Los productos vinculados quedaran sin categoria.'}
        isLoading={deleting}
      />
    </div>
  );
}
