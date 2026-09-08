'use client';

import { ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import ContentTable from './components/ContentTable';
import ContentCards from './components/ContentCards';
import ContentEditorModal from './components/ContentEditorModal';
import DetalleModal from './components/DetalleModal';
import { useProductosContenido } from './useProductosContenido';

export default function ProductosContenidoPage() {
  const {
    form, products, loading, selected, detailItem, deleteTarget, setDeleteTarget, modalOpen, setModalOpen,
    detailOpen, setDetailOpen, saving, deleting, activeTab, setActiveTab, currentPage, setCurrentPage,
    totalPages, paginated, openEditor, openDetail, handleDelete, onSubmit,
  } = useProductosContenido();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Contenido Productos</h1>
        <p className="text-gray-500 text-sm">{products.length} registros</p>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron productos</p></div>
      ) : (
        <div>
          <ContentTable products={paginated} onEdit={openEditor} onDelete={setDeleteTarget} onDetail={openDetail} />
          <ContentCards products={paginated} onEdit={openEditor} onDelete={setDeleteTarget} />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}

      <ContentEditorModal
        isOpen={modalOpen}
        selected={selected}
        products={products}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        form={form}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSubmit={form.handleSubmit(onSubmit)}
      />

      <DetalleModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} item={detailItem} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar producto" description={'Eliminar ' + (deleteTarget?.name || '') + '?'} isLoading={deleting} />
    </div>
  );
}
