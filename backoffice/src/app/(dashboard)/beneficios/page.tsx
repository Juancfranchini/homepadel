'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Benefit {
  id: string;
  icon: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
}

// ─── Iconos disponibles ───────────────────────────────────────────────────────
const AVAILABLE_ICONS = [
  { value: 'Truck', label: '🚚 Envío' },
  { value: 'CreditCard', label: '💳 Pago' },
  { value: 'RefreshCw', label: '🔄 Cambios' },
  { value: 'Lock', label: '🔒 Seguridad' },
  { value: 'Package', label: '📦 Empaque' },
  { value: 'Star', label: '⭐ Calidad' },
  { value: 'Shield', label: '🛡️ Garantía' },
  { value: 'Zap', label: '⚡ Rápido' },
];

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  icon: z.string().min(1, 'Seleccioná un ícono'),
  title: z.string().min(2, 'El título es requerido'),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BeneficiosPage() {
  const { toast } = useToast();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Benefit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Benefit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/benefits/admin/all');
      const data = (Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
      setBenefits([...data].sort((a: Benefit, b: Benefit) => a.order - b.order));
    } catch {
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ active: true, order: benefits.length + 1, icon: 'Truck' });
    setModalOpen(true);
  };

  const openEdit = (b: Benefit) => {
    setEditItem(b);
    reset({
      icon: b.icon,
      title: b.title,
      description: b.description ?? '',
      order: b.order,
      active: b.active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/benefits/${editItem.id}`, data);
        toast('Beneficio actualizado', 'success');
      } else {
        await api.post('/benefits', data);
        toast('Beneficio creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar el beneficio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/benefits/${deleteTarget.id}`);
      toast('Beneficio eliminado', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (b: Benefit) => {
    try {
      await api.patch(`/benefits/${b.id}`, { active: !b.active });
      toast(b.active ? 'Beneficio desactivado' : 'Beneficio activado', 'success');
      load();
    } catch {
      toast('Error al cambiar estado', 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficios</h1>
          <p className="text-gray-500 text-sm mt-0.5">Barra de beneficios del inicio — {benefits.length} registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo beneficio
        </button>
      </div>

      {/* Cards */}
      {benefits.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No hay beneficios creados</p>
          <button onClick={openCreate} className="mt-4 text-sm font-semibold text-[#C8FF00] bg-[#0f172a] px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors">
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Orden', 'Ícono', 'Título', 'Descripción', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {benefits.map((b) => {
                const iconLabel = AVAILABLE_ICONS.find((i) => i.value === b.icon)?.label ?? b.icon;
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {b.order}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center text-sm">
                        {iconLabel.split(' ')[0]}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.title}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm max-w-[250px] truncate">{b.description ?? '—'}</td>
                    <td className="px-4 py-3"><ActiveBadge active={b.active} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleActive(b)}
                          className={`p-1.5 rounded-lg transition-colors ${b.active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={b.active ? 'Desactivar' : 'Activar'}
                        >
                          {b.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar beneficio' : 'Nuevo beneficio'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ícono *</label>
            <select {...register('icon')} className={inputClass}>
              {AVAILABLE_ICONS.map((ic) => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
            {errors.icon && <p className="text-xs text-red-600 mt-1">{errors.icon.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input {...register('title')} className={inputClass} placeholder="Ej: Envío gratis" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input {...register('description')} className={inputClass} placeholder="En compras mayores a $50.000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input type="number" min={0} {...register('order')} className={inputClass} />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="bActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="bActive" className="text-sm text-gray-700">Beneficio activo</label>
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
        title="Eliminar beneficio"
        description={`¿Eliminar "${deleteTarget?.title}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

