'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ArrowUpDown, Star, User, HelpCircle, X } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';
import ReviewsSearchBar from './components/ReviewsSearchBar';
import ReviewsAdvancedSearchModal, { ReviewsAdvancedFilters } from './components/ReviewsAdvancedSearchModal';

interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  active: boolean;
  verified: boolean;
  createdAt: string;
  product?: { id: string; name: string };
}

const schema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  name: z.string().min(2, 'El nombre es requerido'),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
  active: z.boolean().default(true),
  verified: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function ReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ReviewsAdvancedFilters | null>(null);
  const [products, setProducts] = useState<{id:string;name:string}[]>([]);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoData, setInfoData] = useState({ title: 'Como se calculan las opiniones?', content: '' });
  const pageSize = 10;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const watchRating = watch('rating');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/admin/all');
      setReviews(Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.value || []));
    } catch { setReviews([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/products?showAll=1&limit=500').then(r => {
      const data = r.data?.items || r.data?.data || r.data || [];
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/site-sections/reviews_info').then(r => {
      const d = r.data?.data || r.data || {};
      if (d.title) setInfoData({ title: d.title, content: d.content || '' });
    }).catch(() => {});
  }, []);

  const openCreate = () => { setEditItem(null); reset({ productId: '', name: '', rating: 5, comment: '', active: true, verified: true }); setModalOpen(true); };
  const openEdit = (r: Review) => { setEditItem(r); reset({ productId: r.productId, name: r.name, rating: r.rating, comment: r.comment, active: r.active, verified: r.verified }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/reviews/' + editItem.id, data); toast('Resena actualizada', 'success'); }
      else { await api.post('/reviews', data); toast('Resena creada', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (r: Review) => {
    try { await api.patch('/reviews/' + r.id + '/approve'); toast(r.active ? 'Desaprobada' : 'Aprobada', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/reviews/' + deleteTarget.id); toast('Eliminada', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortIcon = (field: string) => (
    <ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => handleSort(field)} />
  );

  const filtered = reviews.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
    if (!advancedFilters) return matchSearch;
    const matchProduct = advancedFilters.productId ? r.productId === advancedFilters.productId : true;
    const matchActive = advancedFilters.active !== null ? r.active === advancedFilters.active : true;
    const matchRating = advancedFilters.rating !== null ? r.rating === advancedFilters.rating : true;
    return matchSearch && matchProduct && matchActive && matchRating;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || ''; const bVal = (b as any)[sortField] || '';
    if (sortField === 'rating') return sortDir === 'asc' ? a.rating - b.rating : b.rating - a.rating;
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Resenas de productos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} resenas</p>
        <div className="flex items-center gap-2">
          <ReviewsSearchBar value={search} onChange={setSearch} onAdvancedSearch={() => setAdvancedOpen(true)} hasAdvancedFilters={advancedFilters !== null} onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); }} />
          <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-2 px-4 py-2 border border-[#C8FF00]/50 text-gray-600 rounded-lg font-semibold text-sm hover:bg-[#C8FF00]/10 hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors"><HelpCircle className="w-4 h-4" />Info</button>          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
            <Plus className="w-4 h-4" />Nueva resena
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron resenas</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Punt. {sortIcon('rating')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Comentario</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr></thead>
            <tbody>
              {paginated.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{r.product?.name || r.productId}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-3.5 h-3.5 text-gray-400" /></div><span className="text-sm font-medium text-gray-900">{r.name}</span></div></td>
                  <td className="px-4 py-3 text-center"><div className="flex gap-0.5 justify-center">{[1,2,3,4,5].map((s) => (<Star key={s} className={'w-3 h-3 ' + (s <= r.rating ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200')} />))}</div></td>
                  <td className="px-4 py-3 hidden md:table-cell"><p className="text-sm text-gray-500 truncate max-w-xs">{r.comment}</p></td>
                  <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-2"><Toggle checked={r.active} onChange={() => toggleActive(r)} /><span className={'text-xs font-medium ' + (r.active ? 'text-green-600' : 'text-gray-400')}>{r.active ? 'Activo' : 'Inactivo'}</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button><button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button></div></td>
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

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar resena' : 'Nueva resena'} size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label><select {...register('productId')} className={inputClass}><option value="">Seleccionar</option>{products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>{errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId.message}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input {...register('name')} className={inputClass} />{errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Puntuacion *</label><div className="flex items-center gap-2"><input type="number" min={1} max={5} {...register('rating')} className={inputClass + ' w-20'} /><div className="flex gap-0.5">{[1,2,3,4,5].map((s) => (<Star key={s} className={'w-5 h-5 ' + (s <= (watchRating || 5) ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200')} />))}</div></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Comentario *</label><textarea {...register('comment')} rows={3} className={inputClass} />{errors.comment && <p className="text-xs text-red-600 mt-1">{errors.comment.message}</p>}</div>
            <div className="flex items-center gap-4"><label className="flex items-center gap-2"><input type="checkbox" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Aprobada</label><label className="flex items-center gap-2"><input type="checkbox" {...register('verified')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Verificada</label></div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button><button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button></div>
          </form>
        </Modal>
      )}

      <ReviewsAdvancedSearchModal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }} products={products} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar resena" description={'Eliminar la resena de ' + (deleteTarget?.name || '') + '?'} isLoading={deleting} />

      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInfoModal(false)} />
          <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#C8FF00]" />
                <h3 className="text-lg font-semibold text-gray-900">Info Reviews</h3>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Pregunta</label>
                <input value={infoData.title} onChange={(e) => setInfoData({ ...infoData, title: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Respuesta</label>
                <textarea value={infoData.content} onChange={(e) => setInfoData({ ...infoData, content: e.target.value })} rows={5} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowInfoModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={async () => { await api.put("/site-sections/reviews_info", { data: infoData, active: true }); toast("Informacion guardada", "success"); setShowInfoModal(false); }} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] transition-colors">Actualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
