'use client';

import { Plus, Edit2, Trash2, ArrowRight, X, ArrowUpDown, Tags, Undo2 } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Toggle from '../testimonios/components/Toggle';
import FaqSearchBar from './components/FaqSearchBar';
import FaqAdvancedSearchModal from './components/FaqAdvancedSearchModal';
import FaqCategoryManager from './components/FaqCategoryManager';
import { useFaq, FaqItem } from './useFaq';

const inputClass = 'w-full px-3 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

function FaqTable({ faqs, sortIcon, onToggleActive, onEdit, onDelete, onDetail }: {
  faqs: FaqItem[]; sortIcon: (field: string) => React.ReactNode; onToggleActive: (t: FaqItem) => void; onEdit: (t: FaqItem) => void; onDelete: (t: FaqItem) => void; onDetail: (t: FaqItem) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Orden {sortIcon('order')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pregunta</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Respuesta</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-center text-sm text-gray-500">{t.order}</td>
                <td className="px-4 py-3"><span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.category || 'GENERAL'}</span></td>
                <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm line-clamp-2">{t.question}</p></td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell line-clamp-2">{t.answer}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Toggle checked={t.active} onChange={() => onToggleActive(t)} />
                    <span className={'text-xs font-medium ' + (t.active ? 'text-green-600' : 'text-gray-400')}>{t.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(t)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => onDetail(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FaqCards({ faqs, onToggleActive, onEdit, onDelete, onDetail }: {
  faqs: FaqItem[]; onToggleActive: (t: FaqItem) => void; onEdit: (t: FaqItem) => void; onDelete: (t: FaqItem) => void; onDetail: (t: FaqItem) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {faqs.map((t) => (
        <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.category || 'GENERAL'}</span>
            <div className="flex items-center gap-2">
              <Toggle checked={t.active} onChange={() => onToggleActive(t)} />
              <span className={'text-xs font-medium ' + (t.active ? 'text-green-600' : 'text-gray-400')}>{t.active ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
          <div>
            <p className="text-gray-900 font-medium text-sm line-clamp-2">{t.question}</p>
            <p className="text-gray-500 text-sm line-clamp-2 mt-1">{t.answer}</p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Orden: {t.order}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(t)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => onDetail(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqFormModal({ isOpen, editItem, categories, register, errors, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: FaqItem | null; categories: string[]; register: any; errors: any; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar FAQ' : 'Nueva FAQ'} size="sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select {...register('category')} className={inputClass}>
            {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta *</label>
          <input {...register('question')} className={inputClass} placeholder="Ej: Como realizo una compra?" />
          {errors.question && <p className="text-xs text-red-600 mt-1">{errors.question.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta *</label>
          <textarea {...register('answer')} rows={4} className={inputClass} placeholder="Explica la respuesta..." />
          {errors.answer && <p className="text-xs text-red-600 mt-1">{errors.answer.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
          <input type="number" min={0} {...register('order')} className={inputClass} />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="fActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label htmlFor="fActive" className="text-sm text-gray-700">Visible en el sitio</label>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}

function FaqDetailPanel({ item, onClose }: { item: FaqItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 bg-white border border-gray-200 rounded-2xl px-4 sm:px-6 py-4 sm:py-6 w-full max-w-md mx-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Detalle de FAQ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Categoría</p>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.category || 'GENERAL'}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pregunta</p>
          <p className="text-gray-900 font-semibold">{item.question}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Respuesta</p>
          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
        </div>
        <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span>Orden: {item.order}</span>
          <span>{item.active ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const {
    form, faqs, loading, modalOpen, setModalOpen, detailItem, setDetailItem, editItem, deleteTarget, setDeleteTarget,
    deleting, saving, search, setSearch, advancedOpen, setAdvancedOpen, advancedFilters, setAdvancedFilters,
    sortField, currentPage, setCurrentPage, categories, setCategories, showCategories, setShowCategories,
    openCreate, openEdit, onSubmit, handleDelete, toggleActive, handleSort, totalPages, paginated: páginated,
  } = useFaq();
  const { register, handleSubmit, formState: { errors } } = form;

  const sortIcon = (field: string) => (
    <ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => handleSort(field)} />
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{faqs.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          {!showCategories && (
            <>
              <FaqSearchBar value={search} onChange={setSearch} onAdvancedSearch={() => setAdvancedOpen(true)} hasAdvancedFilters={advancedFilters !== null} onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); }} />
              <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
                <Plus className="w-4 h-4" />Nueva FAQ
              </button>
            </>
          )}
          {showCategories ? (
            <button onClick={() => setShowCategories(false)} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-medium hover:bg-[#b8ef00] transition-colors">
              <Undo2 className="w-4 h-4" />Regresar a FAQ
            </button>
          ) : (
            <button onClick={() => setShowCategories(true)} className="flex items-center gap-2 px-4 py-2 border border-[#C8FF00]/50 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Tags className="w-4 h-4" />Categorías FAQ
            </button>
          )}
        </div>
      </div>

      {showCategories ? (
        <FaqCategoryManager
          categories={categories}
          onAdd={(cat) => setCategories(prev => [...prev, cat].sort())}
          onEdit={(old, newName) => setCategories(prev => prev.map(c => c === old ? newName : c).sort())}
          onDelete={(cat) => setCategories(prev => prev.filter(c => c !== cat))}
        />
      ) : (
        <>
          {páginated.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron FAQs</p></div>
          ) : (
            <>
              <FaqTable faqs={páginated} sortIcon={sortIcon} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} onDetail={setDetailItem} />
              <FaqCards faqs={páginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} onDetail={setDetailItem} />
            </>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      <FaqFormModal isOpen={modalOpen} editItem={editItem} categories={categories} register={register} errors={errors} saving={saving} onClose={() => setModalOpen(false)} onSubmit={handleSubmit(onSubmit)} />

      {detailItem && <FaqDetailPanel item={detailItem} onClose={() => setDetailItem(null)} />}

      <FaqAdvancedSearchModal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar FAQ" description={'Eliminar la pregunta: ' + (deleteTarget?.question || '') + '?'} isLoading={deleting} />
    </div>
  );
}
