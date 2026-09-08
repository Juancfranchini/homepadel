'use client';

import { Plus, Edit2, Trash2, ArrowLeft, Save, Ruler, X } from 'lucide-react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import Toggle from '../../testimonios/components/Toggle';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useTalles, getCategoryName, getProductNames, SizeGuide, Category } from './useTalles';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

function GuidesTable({ guides, getCategoryName, getProductNames, onToggleActive, onEdit, onDelete }: {
  guides: SizeGuide[]; getCategoryName: (id: string) => string; getProductNames: (ids: string[]) => string;
  onToggleActive: (item: SizeGuide) => void; onEdit: (item: SizeGuide) => void; onDelete: (item: SizeGuide) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {guides.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{item.name}</p></td>
              <td className="px-4 py-3"><span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getCategoryName(item.categoryId)}</span></td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{getProductNames(item.productIds || []) || 'Todos'}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Toggle checked={item.active} onChange={() => onToggleActive(item)} />
                  <span className={'text-xs font-medium ' + (item.active ? 'text-green-600' : 'text-gray-400')}>{item.active ? 'Activo' : 'Inactivo'}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GuidesCards({ guides, getCategoryName, getProductNames, onToggleActive, onEdit, onDelete }: {
  guides: SizeGuide[]; getCategoryName: (id: string) => string; getProductNames: (ids: string[]) => string;
  onToggleActive: (item: SizeGuide) => void; onEdit: (item: SizeGuide) => void; onDelete: (item: SizeGuide) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {guides.map((item) => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-gray-900 font-medium text-sm">{item.name}</p>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full inline-block mt-1">{getCategoryName(item.categoryId)}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Toggle checked={item.active} onChange={() => onToggleActive(item)} />
                <span className={'text-xs font-medium ' + (item.active ? 'text-green-600' : 'text-gray-400')}>{item.active ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          {item.productIds && item.productIds.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Productos</p>
              <p className="text-sm text-gray-600">{getProductNames(item.productIds) || 'Todos'}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GuideFormModal({ isOpen, editItem, categories, filteredProducts, selectedProducts, productSearch, onProductSearchChange, onToggleProduct, products,
  register, errors, watch, setValue, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: SizeGuide | null; categories: Category[]; filteredProducts: { id: string; name: string }[];
  selectedProducts: string[]; productSearch: string; onProductSearchChange: (v: string) => void; onToggleProduct: (id: string) => void;
  products: { id: string; name: string }[]; register: any; errors: any; watch: any; setValue: any; saving: boolean;
  onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar Guía' : 'Nueva Guía'} size="lg">
      <form onSubmit={onSubmit} className="space-y-4 px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input {...register('name')} className={inputClass} placeholder="Ej: Guía de Talles Calzado" />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Categoría *</label>
            <select {...register('categoryId')} className={inputClass}>
              <option value="">Seleccionar categoria</option>
              {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Productos asociados (opcional)</label>
          <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full px-3 py-1.5 border-b border-gray-100 text-xs mb-2 focus:outline-none"
            />
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-gray-400">No se encontraron productos</p>
            ) : (
              filteredProducts.slice(0, 50).map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded text-sm">
                  <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => onToggleProduct(p.id)} className="w-3.5 h-3.5 rounded accent-[#C8FF00]" />
                  <span className="text-gray-700 text-xs">{p.name}</span>
                </label>
              ))
            )}
          </div>
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedProducts.map(pid => {
                const p = products.find(pr => pr.id === pid);
                return (
                  <span key={pid} className="inline-flex items-center gap-1 bg-[#C8FF00]/10 text-[#0f172a] text-xs px-2 py-0.5 rounded-full">
                    {p?.name || pid}
                    <button type="button" onClick={() => onToggleProduct(pid)}><X size={12} /></button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Contenido</label>
          <RichTextEditor content={watch('content') || ''} onChange={(html: string) => setValue('content', html, { shouldDirty: true })} />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="sgActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label htmlFor="sgActive" className="text-sm text-gray-700">Visible en el sitio</label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
            <Save className="w-4 h-4 inline mr-1" />{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function GuidesSection({ guides, paginatedGuides, categories, products, pageSize, currentPage, totalPages, onToggleActive, onEdit, onDelete, onPrev, onNext }: {
  guides: SizeGuide[]; paginatedGuides: SizeGuide[]; categories: Category[]; products: { id: string; name: string }[];
  pageSize: number; currentPage: number; totalPages: number; onToggleActive: (item: SizeGuide) => void;
  onEdit: (item: SizeGuide) => void; onDelete: (item: SizeGuide) => void; onPrev: () => void; onNext: () => void;
}) {
  if (guides.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
        <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No hay Guías de talles configuradas</p>
      </div>
    );
  }
  const catName = (id: string) => getCategoryName(categories, id);
  const prodNames = (ids: string[]) => getProductNames(products, ids);
  return (
    <>
      <GuidesTable guides={guides} getCategoryName={catName} getProductNames={prodNames} onToggleActive={onToggleActive} onEdit={onEdit} onDelete={onDelete} />
      <GuidesCards guides={paginatedGuides} getCategoryName={catName} getProductNames={prodNames} onToggleActive={onToggleActive} onEdit={onEdit} onDelete={onDelete} />
      {guides.length > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={onPrev} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
          <span className="text-sm text-gray-500">Página {currentPage} de {totalPages}</span>
          <button onClick={onNext} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
        </div>
      )}
    </>
  );
}

export default function TallesPage() {
  const {
    form, guides, categories, products, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget,
    saving, selectedProducts, productSearch, setProductSearch, currentPage, setCurrentPage,
    openCreate, openEdit, toggleProduct, onSubmit, handleDelete, toggleActive,
    pageSize, totalPages, paginatedGuides, filteredProducts,
  } = useTalles();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Ruler className="w-5 h-5 text-[#C8FF00]" />Guía de Talles</h1>
            <p className="text-gray-500 text-sm mt-0.5">{guides.length} Guías configuradas</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nueva Guía
        </button>
      </div>

      <GuidesSection
        guides={guides} paginatedGuides={paginatedGuides} categories={categories} products={products}
        pageSize={pageSize} currentPage={currentPage} totalPages={totalPages}
        onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget}
        onPrev={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        onNext={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
      />

      <GuideFormModal
        isOpen={modalOpen}
        editItem={editItem}
        categories={categories}
        filteredProducts={filteredProducts}
        selectedProducts={selectedProducts}
        productSearch={productSearch}
        onProductSearchChange={setProductSearch}
        onToggleProduct={toggleProduct}
        products={products}
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit(onSubmit)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Guía"
        description={'Eliminar la Guía ' + (deleteTarget?.name || '') + '?'}
      />
    </div>
  );
}