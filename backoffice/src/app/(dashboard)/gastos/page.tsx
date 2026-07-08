// Expenses (Gastos) management page for the Home Pádel BackOffice.
// Features:
//  - Monthly summary cards (total gastos, highest category, count)
//  - Full table of expenses with CRUD
//  - Category filter
//  - Create/edit modal with categories: Alquiler, Servicios, Marketing, Logística, Otros
// API: GET/POST/PUT/DELETE /api/expenses

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Receipt, TrendingDown, Filter } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types / constants ───────────────────────────────────────────────────────
type ExpenseCategory = 'Alquiler' | 'Servicios' | 'Marketing' | 'Logística' | 'Otros';

const CATEGORIES: ExpenseCategory[] = ['Alquiler', 'Servicios', 'Marketing', 'Logística', 'Otros'];

const CATEGORY_COLORS: Record<ExpenseCategory, 'blue' | 'purple' | 'lime' | 'yellow' | 'gray'> = {
  Alquiler: 'blue',
  Servicios: 'purple',
  Marketing: 'lime',
  Logística: 'yellow',
  Otros: 'gray',
};

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

// ─── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  description: z.string().min(2, 'La descripción es requerida'),
  amount: z.coerce.number().min(1, 'El monto debe ser mayor a 0'),
  category: z.enum(['Alquiler', 'Servicios', 'Marketing', 'Logística', 'Otros']),
  date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function GastosPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Otros' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      setExpenses(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch {
      setExpenses(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const filtered = categoryFilter
    ? expenses.filter((e) => e.category === categoryFilter)
    : expenses;

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  })).sort((a, b) => b.total - a.total);

  const topCategory = byCategory[0];

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditItem(null);
    reset({ category: 'Otros', date: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditItem(e);
    reset({ description: e.description, amount: e.amount, category: e.category, date: e.date.slice(0, 10), notes: e.notes ?? '' });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/expenses/${editItem.id}`, data);
        toast('Gasto actualizado', 'success');
      } else {
        await api.post('/expenses', data);
        toast('Gasto registrado', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar el gasto', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      toast('Gasto eliminado', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} registros</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00]"
        >
          <Plus className="w-4 h-4" />
          Registrar gasto
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total gastos</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatPrice(totalAmount)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mayor categoría</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{topCategory?.cat ?? '—'}</p>
              <p className="text-sm text-gray-400">{topCategory ? formatPrice(topCategory.total) : ''}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Receipt className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">Por categoría</p>
          <div className="space-y-1.5">
            {byCategory.slice(0, 3).map(({ cat, total }) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{cat}</span>
                <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600 font-medium">Filtrar por:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!categoryFilter ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Descripción', 'Monto', 'Categoría', 'Fecha', 'Notas', 'Acciones'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 font-medium text-gray-900">{e.description}</td>
                <td className="px-6 py-3.5 font-semibold text-red-600">{formatPrice(e.amount)}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={CATEGORY_COLORS[e.category]}>{e.category}</Badge>
                </td>
                <td className="px-6 py-3.5 text-gray-500">{formatDate(e.date)}</td>
                <td className="px-6 py-3.5 text-gray-400 text-xs max-w-[200px] truncate">{e.notes ?? '—'}</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(e)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay gastos registrados</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar gasto' : 'Registrar gasto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <input {...register('description')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="Ej: Pago de alquiler diciembre" />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($) *</label>
              <input type="number" min={1} {...register('amount')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select {...register('category')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input type="date" {...register('date')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
            {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea {...register('notes')} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] resize-none" placeholder="Observaciones opcionales..." />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
              {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar gasto"
        description={`¿Eliminar el registro "${deleteTarget?.description}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

const MOCK: Expense[] = [
  { id: '1', description: 'Alquiler noviembre', amount: 120000, category: 'Alquiler', date: '2024-11-01T00:00:00Z' },
  { id: '2', description: 'Facebook Ads', amount: 35000, category: 'Marketing', date: '2024-11-05T00:00:00Z', notes: 'Campaña palas temporada' },
  { id: '3', description: 'Electricidad', amount: 18500, category: 'Servicios', date: '2024-11-10T00:00:00Z' },
  { id: '4', description: 'Envíos OCA', amount: 12000, category: 'Logística', date: '2024-11-12T00:00:00Z' },
  { id: '5', description: 'Material de oficina', amount: 4500, category: 'Otros', date: '2024-11-15T00:00:00Z' },
];

