'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ArrowRight, X, ArrowUpDown, Tags, Undo2 } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';
import FaqSearchBar from './components/FaqSearchBar';
import FaqAdvancedSearchModal, { FaqAdvancedFilters } from './components/FaqAdvancedSearchModal';
import FaqCategoryManager from './components/FaqCategoryManager';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

const schema = z.object({
  category: z.string().default('GENERAL'),
  question: z.string().min(5, 'La pregunta es requerida'),
  answer: z.string().min(10, 'La respuesta debe tener al menos 10 caracteres'),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function FaqPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<FaqItem | null>(null);
  const [editItem, setEditItem] = useState<FaqItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FaqAdvancedFilters | null>(null);
  const [sortField, setSortField] = useState<string>('order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [categories, setCategories] = useState(['COMPRAS', 'ENVIOS', 'PAGOS', 'DEVOLUCIONES', 'PRODUCTOS', 'GENERAL']);
  const [showCategories, setShowCategories] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/faq/admin/all');
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setFaqs([...data].sort((a: FaqItem, b: FaqItem) => a.order - b.order));
    } catch { setFaqs([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); reset({ active: true, order: faqs.length + 1, category: 'GENERAL' }); setModalOpen(true); };
  const openEdit = (t: FaqItem) => { setEditItem(t); reset({ category: t.category || 'GENERAL', question: t.question, answer: t.answer, order: t.order, active: t.active }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/faq/' + editItem.id, data); toast('FAQ actualizada', 'success'); }
      else { await api.post('/faq', data); toast('FAQ creada', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/faq/' + deleteTarget.id); toast('FAQ eliminada', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  const toggleActive = async (t: FaqItem) => {
    try { await api.patch('/faq/' + t.id, { active: !t.active }); toast(t.active ? 'FAQ ocultada' : 'FAQ activada', 'success'); load(); }
    catch { toast('Error al cambiar estado', 'error'); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const sortIcon = (field: string) => (
    <ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => handleSort(field)} />
  );

  const filtered = faqs.filter(t => {
    const matchSearch = t.question.toLowerCase().includes(search.toLowerCase()) || t.answer.toLowerCase().includes(search.toLowerCase());
    if (!advancedFilters) return matchSearch;
    const matchCat = advancedFilters.category ? t.category === advancedFilters.category : true;
    const matchActive = advancedFilters.active !== null ? t.active === advancedFilters.active : true;
    return matchSearch && matchCat && matchActive;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || ''; const bVal = (b as any)[sortField] || '';
    if (sortField === 'order') return sortDir === 'asc' ? (a.order - b.order) : (b.order - a.order);
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
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
              <Tags className="w-4 h-4" />Categorias FAQ
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
          {paginated.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron FAQs</p></div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Orden {sortIcon('order')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pregunta</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Respuesta</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center text-sm text-gray-500">{t.order}</td>
                      <td className="px-4 py-3"><span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.category || 'GENERAL'}</span></td>
                      <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm line-clamp-2">{t.question}</p></td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell line-clamp-2">{t.answer}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Toggle checked={t.active} onChange={() => toggleActive(t)} />
                          <span className={'text-xs font-medium ' + (t.active ? 'text-green-600' : 'text-gray-400')}>{t.active ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                          <button onClick={() => setDetailItem(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar FAQ' : 'Nueva FAQ'} size="sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
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
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </Modal>
      )}

      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDetailItem(null)} />
          <div className="relative z-10 bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detalle de FAQ</h3>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Categoria</p>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{detailItem.category || 'GENERAL'}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pregunta</p>
              <p className="text-gray-900 font-semibold">{detailItem.question}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Respuesta</p>
              <p className="text-gray-600 text-sm leading-relaxed">{detailItem.answer}</p>
            </div>
            <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>Orden: {detailItem.order}</span>
              <span>{detailItem.active ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        </div>
      )}

      <FaqAdvancedSearchModal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar FAQ" description={'Eliminar la pregunta: ' + (deleteTarget?.question || '') + '?'} isLoading={deleting} />
    </div>
  );
}