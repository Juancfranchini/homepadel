'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Star, ArrowRight, X, ArrowUpDown } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import SearchBar from './components/SearchBar';
import Toggle from './components/Toggle';
import AdvancedSearchModal, { AdvancedFilters } from './components/AdvancedSearchModal';
import Pagination from '@/components/ui/Pagination';

interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  photo?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  photo: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={'w-3.5 h-3.5 ' + (i < rating ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200')} />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TestimoniosPage() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Testimonial | null>(null);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/testimonials/admin/all');
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setTestimonials([...data].sort((a: Testimonial, b: Testimonial) => a.order - b.order));
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ active: true, order: testimonials.length + 1, rating: 5 });
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditItem(t);
    reset({ name: t.name, comment: t.comment, rating: t.rating, photo: t.photo ?? '', order: t.order, active: t.active });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.patch('/testimonials/' + editItem.id, data);
        toast('Testimonio actualizado', 'success');
      } else {
        await api.post('/testimonials', data);
        toast('Testimonio creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete('/testimonials/' + deleteTarget.id);
      toast('Testimonio eliminado', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (t: Testimonial) => {
    try {
      await api.patch('/testimonials/' + t.id, { active: !t.active });
      toast(t.active ? 'Testimonio ocultado' : 'Testimonio activado', 'success');
      load();
    } catch {
      toast('Error al cambiar estado', 'error');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const sortIcon = (field: string) => (
    <ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => handleSort(field)} />
  );

  const filtered = testimonials.filter(t => {
    const matchName = t.name.toLowerCase().includes(search.toLowerCase());
    if (!advancedFilters) return matchName;
    const matchRating = advancedFilters.rating ? t.rating === advancedFilters.rating : true;
    const matchActive = advancedFilters.active !== null ? t.active === advancedFilters.active : true;
    const matchDateFrom = advancedFilters.dateFrom ? new Date(t.createdAt) >= new Date(advancedFilters.dateFrom) : true;
    const matchDateTo = advancedFilters.dateTo ? new Date(t.createdAt) <= new Date(advancedFilters.dateTo + 'T23:59:59') : true;
    return matchName && matchRating && matchActive && matchDateFrom && matchDateTo;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || '';
    const bVal = (b as any)[sortField] || '';
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      return sortDir === 'asc' ? new Date(aVal).getTime() - new Date(bVal).getTime() : new Date(bVal).getTime() - new Date(aVal).getTime();
    }
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{testimonials.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar value={search} onChange={setSearch} onAdvancedSearch={() => setAdvancedOpen(true)} hasAdvancedFilters={advancedFilters !== null} onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); }} />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
            <Plus className="w-4 h-4" />Nuevo testimonio
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No se encontraron testimonios</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Creado{sortIcon('createdAt')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Modificado{sortIcon('updatedAt')}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Puntuacion{sortIcon('rating')}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center">
                        <span className="text-[#C8FF00] font-bold text-xs">{t.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium text-sm">{t.name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{formatDate(t.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center"><StarRating rating={t.rating} /></div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Toggle checked={t.active} onChange={() => toggleActive(t)} />
                      <span className={'text-xs font-medium ' + (t.active ? 'text-green-600' : 'text-gray-400')}>
                        {t.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDetailItem(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar testimonio' : 'Nuevo testimonio'} size="sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input {...register('name')} className={inputClass} placeholder="Ej: Martin R." />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentario *</label>
              <textarea {...register('comment')} rows={4} className={inputClass} placeholder="Excelente producto..." />
              {errors.comment && <p className="text-xs text-red-600 mt-1">{errors.comment.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puntuacion</label>
              <select {...register('rating')} className={inputClass}>
                {[5, 4, 3, 2, 1].map(r => (<option key={r} value={r}>{r} estrella{r > 1 ? 's' : ''}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
              <input {...register('photo')} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" min={0} {...register('order')} className={inputClass} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="tActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
              <label htmlFor="tActive" className="text-sm text-gray-700">Visible en el sitio</label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
                {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDetailItem(null)} />
          <div className="relative z-10 bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detalle del testimonio</h3>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3">
              {detailItem.photo ? (
                <img src={detailItem.photo} alt={detailItem.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#C8FF00]/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#C8FF00]/10 border-2 border-[#C8FF00]/30 flex items-center justify-center">
                  <span className="text-[#C8FF00] font-bold text-sm">{detailItem.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="text-gray-900 font-semibold text-sm">{detailItem.name}</p>
                <StarRating rating={detailItem.rating} />
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed italic">{'"' + detailItem.comment + '"'}</p>
            <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>Creado: {formatDate(detailItem.createdAt)}</span>
              <span>Modificado: {formatDate(detailItem.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}

      <AdvancedSearchModal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }} />

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