// Promotions (Promociones) management page for the Home Pádel BackOffice.
// CRUD: list, create/edit with date range pickers, delete.
// API: GET/POST/PUT/DELETE /api/promotions

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Percent, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Promotion {
  id: string;
  title: string;
  discount: number;
  startDate: string;
  endDate: string;
  active: boolean;     // campo real en la API
  description?: string;
}

// ─── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  description: z.string().optional(),
  discount: z.coerce.number().min(1).max(100, 'El descuento debe estar entre 1 y 100'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PromocionesPage() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions');
      setPromos(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch {
      setPromos(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ isActive: true, discount: 10 });
    setModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditItem(p);
    reset({
      title: p.title,
      description: p.description ?? '',
      discount: p.discount,
      startDate: p.startDate.slice(0, 10),
      endDate: p.endDate.slice(0, 10),
      isActive: p.active,    // API devuelve 'active', form usa 'isActive'
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/promotions/${editItem.id}`, data);
        toast('Promoción actualizada', 'success');
      } else {
        await api.post('/promotions', data);
        toast('Promoción creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar la promoción', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/promotions/${deleteTarget.id}`);
      toast('Promoción eliminada', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isUpcoming = (date: string) => new Date(date) > new Date();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
          <p className="text-gray-500 text-sm mt-0.5">{promos.length} promociones registradas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00]"
        >
          <Plus className="w-4 h-4" />
          Nueva promoción
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Título', 'Descuento', 'Vigencia', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {promos.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Percent className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.title}</p>
                      {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className="text-2xl font-black text-[#0f172a]">{p.discount}</span>
                  <span className="text-sm text-gray-500">%</span>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDate(p.startDate)}</span>
                    <span className="text-gray-300">→</span>
                    <span className={isExpired(p.endDate) ? 'text-red-500' : ''}>{formatDate(p.endDate)}</span>
                  </div>
                  {isExpired(p.endDate) && (
                    <span className="text-xs text-red-500 font-medium">Vencida</span>
                  )}
                  {isUpcoming(p.startDate) && (
                    <span className="text-xs text-blue-500 font-medium">Próximamente</span>
                  )}
                </td>
                <td className="px-6 py-3.5"><ActiveBadge active={p.active} /></td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promos.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Percent className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay promociones aún</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar promoción' : 'Nueva promoción'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input {...register('title')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="Ej: Promo de verano" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea {...register('description')} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] resize-none" placeholder="Descripción opcional..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%) *</label>
            <input type="number" min={1} max={100} {...register('discount')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="10" />
            {errors.discount && <p className="text-xs text-red-600 mt-1">{errors.discount.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
              <input type="date" {...register('startDate')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
              {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
              <input type="date" {...register('endDate')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
              {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="promoActive" {...register('isActive')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="promoActive" className="text-sm text-gray-700">Promoción activa</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
              {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar promoción"
        description={`¿Eliminar la promoción "${deleteTarget?.title}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

const MOCK: Promotion[] = [
  { id: '1', title: 'Promo de verano', discount: 20, startDate: '2024-12-01T00:00:00Z', endDate: '2025-02-28T00:00:00Z', active: true, description: 'Descuento en palas y zapatillas' },
  { id: '2', title: 'Black Friday', discount: 35, startDate: '2024-11-29T00:00:00Z', endDate: '2024-11-30T00:00:00Z', active: false },
  { id: '3', title: 'Liquidación de stock', discount: 15, startDate: '2024-11-01T00:00:00Z', endDate: '2024-11-30T00:00:00Z', active: true },
];

