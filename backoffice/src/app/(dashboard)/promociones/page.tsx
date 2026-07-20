'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Percent } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount: number;
  ctaText?: string;
  ctaUrl?: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const schema = z.object({
  title: z.string().min(2, 'Titulo requerido'),
  description: z.string().optional().or(z.literal('')),
  discount: z.coerce.number().min(1, 'Descuento requerido'),
  ctaText: z.string().optional().or(z.literal('')),
  ctaUrl: z.string().optional().or(z.literal('')),
  startDate: z.string().min(1, 'Fecha requerida'),
  endDate: z.string().min(1, 'Fecha requerida'),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function PromocionesPage() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions');
      const data = res.data?.value || res.data?.data || res.data;
      setPromotions(Array.isArray(data) ? data : []);
    } catch { setPromotions([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); reset({ title: '', description: '', discount: 10, ctaText: '', ctaUrl: '', startDate: '', endDate: '', active: true }); setModalOpen(true); };
  const openEdit = (p: Promotion) => { setEditItem(p); reset({ title: p.title, description: p.description || '', discount: p.discount, ctaText: p.ctaText || '', ctaUrl: p.ctaUrl || '', startDate: p.startDate.slice(0, 10), endDate: p.endDate.slice(0, 10), active: p.active }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { ...data, startDate: new Date(data.startDate).toISOString(), endDate: new Date(data.endDate).toISOString() };
      if (editItem) { await api.patch('/promotions/' + editItem.id, payload); toast('Promocion actualizada', 'success'); }
      else { await api.post('/promotions', payload); toast('Promocion creada', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (p: Promotion) => {
    try { await api.patch('/promotions/' + p.id, { active: !p.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/promotions/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
          <p className="text-gray-500 text-sm mt-0.5">{promotions.length} promociones</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nueva promocion
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No hay promociones</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descuento</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Vigencia</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr></thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium text-sm">{p.title}</p>
                    {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-center"><span className="text-sm font-bold text-green-600">{p.discount}% OFF</span></td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500 hidden md:table-cell">{new Date(p.startDate).toLocaleDateString('es-AR')} - {new Date(p.endDate).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Toggle checked={p.active} onChange={() => toggleActive(p)} />
                      <span className={'text-xs font-medium ' + (p.active ? 'text-green-600' : 'text-gray-400')}>{p.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar promocion' : 'Nueva promocion'} size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input {...register('title')} className={inputClass} placeholder="Ej: Black Friday" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <textarea {...register('description')} rows={2} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%) *</label>
                <input type="number" {...register('discount')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto del boton</label>
                <input {...register('ctaText')} className={inputClass} placeholder="VER OFERTA" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del boton</label>
              <input {...register('ctaUrl')} className={inputClass} placeholder="/catalogo?oferta=true" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                <input type="date" {...register('startDate')} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
                <input type="date" {...register('endDate')} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
              <label className="text-sm text-gray-700">Promocion activa</label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar promocion" description={'Eliminar "' + (deleteTarget?.title || '') + '"?'} isLoading={deleting} />
    </div>
  );
}
