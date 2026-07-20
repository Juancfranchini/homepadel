'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = ['Marketing', 'Logistica', 'Administracion', 'Impuestos', 'Servicios', 'Otros'];

const schema = z.object({
  description: z.string().min(2, 'Descripcion requerida'),
  amount: z.coerce.number().min(1, 'Monto requerido'),
  category: z.string().min(1, 'Categoria requerida'),
  date: z.string().min(1, 'Fecha requerida'),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

function formatCurrency(n: number) { return '$' + n.toLocaleString('es-AR'); }
function formatDate(d: string) { return new Date(d).toLocaleDateString('es-AR'); }

export default function GastosPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      const data = res.data?.value || res.data?.data || res.data;
      setExpenses(Array.isArray(data) ? data : []);
    } catch { setExpenses([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalPages = Math.ceil(expenses.length / pageSize);
  const paginated = expenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => { setEditItem(null); reset({ description: '', amount: 0, category: 'Marketing', date: new Date().toISOString().slice(0, 10) }); setModalOpen(true); };
  const openEdit = (e: Expense) => { setEditItem(e); reset({ description: e.description, amount: e.amount, category: e.category, date: e.date.slice(0, 10) }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/expenses/' + editItem.id, data); toast('Gasto actualizado', 'success'); }
      else { await api.post('/expenses', data); toast('Gasto creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/expenses/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{expenses.length} gastos  Total: <span className="font-semibold text-red-500">{formatCurrency(total)}</span></p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nuevo gasto
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No hay gastos registrados</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripcion</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Fecha</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr></thead>
            <tbody>
              {paginated.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{e.description}</p></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.category}</span></td>
                  <td className="px-4 py-3 text-center"><span className="text-sm font-semibold text-red-500">{formatCurrency(e.amount)}</span></td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500 hidden md:table-cell">{formatDate(e.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(e)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar gasto' : 'Nuevo gasto'} size="sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion *</label>
              <input {...register('description')} className={inputClass} placeholder="Ej: Envio de mercaderia" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <input type="number" {...register('amount')} className={inputClass} />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select {...register('category')} className={inputClass}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" {...register('date')} className={inputClass} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar gasto" description={'Eliminar "' + (deleteTarget?.description || '') + '"?'} isLoading={deleting} />
    </div>
  );
}
