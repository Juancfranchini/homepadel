'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Truck, CreditCard, RefreshCw, Lock, Package, Star, Zap } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';
import { createElement } from 'react';

interface Benefit {
  id: string;
  icon: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
}

const ICON_OPTIONS = [
  { value: 'Truck', label: 'Envio', icon: Truck },
  { value: 'CreditCard', label: 'Pago', icon: CreditCard },
  { value: 'RefreshCw', label: 'Cambios', icon: RefreshCw },
  { value: 'Lock', label: 'Seguridad', icon: Lock },
  { value: 'Package', label: 'Empaque', icon: Package },
  { value: 'Star', label: 'Garantia', icon: Star },
  { value: 'Zap', label: 'Rapido', icon: Zap },
];

const ICON_MAP: Record<string, any> = {};
ICON_OPTIONS.forEach((o) => { ICON_MAP[o.value] = o.icon; });

const schema = z.object({
  icon: z.string().min(1, 'Selecciona un icono'),
  title: z.string().min(2, 'El titulo es requerido'),
  description: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function BeneficiosPage() {
  const { toast } = useToast();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Benefit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Benefit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchIcon = watch('icon');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/benefits/admin/all');
      const data = res.data?.value || res.data?.data || res.data;
      setBenefits(Array.isArray(data) ? [...data].sort((a: Benefit, b: Benefit) => a.order - b.order) : []);
    } catch { setBenefits([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ active: true, order: benefits.length + 1, icon: 'Truck', title: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (b: Benefit) => {
    setEditItem(b);
    reset({ icon: b.icon, title: b.title, description: b.description ?? '', order: b.order, active: b.active });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/benefits/' + editItem.id, data); toast('Beneficio actualizado', 'success'); }
      else { await api.post('/benefits', data); toast('Beneficio creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (b: Benefit) => {
    try { await api.patch('/benefits/' + b.id, { active: !b.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/benefits/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{benefits.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nuevo beneficio
        </button>
      </div>

      {benefits.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron beneficios</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Icono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Descripcion</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map((b) => {
                const IconComp = ICON_MAP[b.icon] || Star;
                return (
                  <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-sm text-gray-400">{b.order}</td>
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center">
                        {createElement(IconComp, { size: 16, className: 'text-[#C8FF00]' })}
                      </div>
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{b.title}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell"><p className="text-gray-500 text-sm">{b.description || '-'}</p></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Toggle checked={b.active} onChange={() => toggleActive(b)} />
                        <span className={'text-xs font-medium ' + (b.active ? 'text-green-600' : 'text-gray-400')}>{b.active ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar beneficio' : 'Nuevo beneficio'} size="sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono *</label>
              <div className="relative">
                <select {...register('icon')} className={inputClass + ' pl-10'}>
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8FF00] pointer-events-none">
                  {createElement(ICON_MAP[watchIcon] || Star, { size: 16 })}
                </span>
              </div>
              {errors.icon && <p className="text-xs text-red-600 mt-1">{errors.icon.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input {...register('title')} className={inputClass} placeholder="Ej: Envio gratis" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <input {...register('description')} className={inputClass} placeholder="En compras mayores a .000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" min={0} {...register('order')} className={inputClass} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="bActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
              <label htmlFor="bActive" className="text-sm text-gray-700">Activo</label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar beneficio" description={'Eliminar "' + (deleteTarget?.title || '') + '"?'} isLoading={deleting} />
    </div>
  );
}
