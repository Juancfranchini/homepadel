// Coupons (Cupones) management page for the Home Pádel BackOffice.
// CRUD: list all coupons, create form with PERCENTAGE/FIXED type, edit, delete.
// API: GET/POST/PUT/DELETE /api/coupons

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Tag, Copy, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge, Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  discount: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;     // campo real en la API
}

// ─── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  discount: z.coerce.number().min(1, 'El descuento debe ser mayor a 0'),
  minAmount: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CuponesPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PERCENTAGE', isActive: true },
  });

  const selectedType = watch('type');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch {
      setCoupons(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ type: 'PERCENTAGE', isActive: true, discount: 10 });
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditItem(c);
    reset({
      code: c.code,
      type: c.type,
      discount: c.discount,
      minAmount: c.minAmount,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      isActive: c.active,    // API devuelve 'active', form usa 'isActive'
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/coupons/${editItem.id}`, data);
        toast('Cupón actualizado', 'success');
      } else {
        await api.post('/coupons', data);
        toast('Cupón creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar el cupón', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/coupons/${deleteTarget.id}`);
      toast('Cupón eliminado', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast(`Código "${code}" copiado`, 'success');
  };

  const isExpired = (date?: string) => !!date && new Date(date) < new Date();
  const usagePercent = (c: Coupon) => c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : null;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupones</h1>
          <p className="text-gray-500 text-sm mt-0.5">{coupons.length} cupones registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00]"
        >
          <Plus className="w-4 h-4" />
          Nuevo cupón
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Código', 'Descuento', 'Tipo', 'Usos', 'Monto mínimo', 'Expira', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c) => {
                const pct = usagePercent(c);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-[#0f172a] px-3 py-1.5 rounded-lg">
                          <Tag className="w-3.5 h-3.5 text-[#C8FF00]" />
                          <code className="text-white font-mono font-bold text-sm">{c.code}</code>
                        </div>
                        <button
                          onClick={() => copyCode(c.code, c.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          title="Copiar código"
                        >
                          {copiedId === c.id ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xl font-black text-gray-900">
                        {c.type === 'PERCENTAGE' ? `${c.discount}%` : formatPrice(c.discount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={c.type === 'PERCENTAGE' ? 'purple' : 'blue'}>
                        {c.type === 'PERCENTAGE' ? 'Porcentaje' : 'Fijo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="min-w-[80px]">
                        <p className="text-sm font-medium text-gray-700">
                          {c.usedCount} / {c.maxUses ?? '∞'}
                        </p>
                        {pct !== null && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{c.minAmount ? formatPrice(c.minAmount) : '—'}</td>
                    <td className="px-4 py-3.5">
                      {c.expiresAt ? (
                        <span className={`text-sm ${isExpired(c.expiresAt) ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                          {formatDate(c.expiresAt)}
                          {isExpired(c.expiresAt) && ' (vencido)'}
                        </span>
                      ) : <span className="text-gray-400">Sin vencimiento</span>}
                    </td>
                    <td className="px-4 py-3.5"><ActiveBadge active={c.active} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay cupones aún</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar cupón' : 'Nuevo cupón'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                {...register('code')}
                style={{ textTransform: 'uppercase' }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
                placeholder="VERANO20"
              />
              {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select {...register('type')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]">
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedType === 'PERCENTAGE' ? 'Descuento (%)' : 'Descuento ($)'} *
              </label>
              <input type="number" min={1} {...register('discount')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
              {errors.discount && <p className="text-xs text-red-600 mt-1">{errors.discount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto mínimo ($)</label>
              <input type="number" min={0} {...register('minAmount')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="Sin mínimo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máx. usos</label>
              <input type="number" min={1} {...register('maxUses')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="Sin límite" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
              <input type="date" {...register('expiresAt')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="couponActive" {...register('isActive')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="couponActive" className="text-sm text-gray-700">Cupón activo</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
              {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear cupón'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar cupón"
        description={`¿Eliminar el cupón "${deleteTarget?.code}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

const MOCK: Coupon[] = [
  { id: '1', code: 'VERANO20', type: 'PERCENTAGE', discount: 20, minAmount: 5000, maxUses: 100, usedCount: 42, expiresAt: '2025-02-28T00:00:00Z', active: true },
  { id: '2', code: 'BIENVENIDO', type: 'PERCENTAGE', discount: 10, usedCount: 189, active: true },
  { id: '3', code: 'ENVIOGRATIS', type: 'FIXED', discount: 2500, minAmount: 15000, maxUses: 50, usedCount: 50, active: false },
  { id: '4', code: 'BF2024', type: 'PERCENTAGE', discount: 35, maxUses: 200, usedCount: 200, expiresAt: '2024-11-30T00:00:00Z', active: false },
];

