// Categories management page for the Home Pádel BackOffice.
// Full CRUD: list all categories in a table, create/edit via modal, delete with confirmation.
// API: GET/POST/PUT/DELETE /api/categories

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count?: { products: number };
}

// ─── Schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

// ─── Page ──────────────────────────────────────────────────────────────────
export default function CategoriasPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data?.data ?? res.data ?? []);
    } catch {
      setCategories(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditItem(c);
    reset({ name: c.name, isActive: c.isActive });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/categories/${editItem.id}`, data);
        toast('Categoría actualizada', 'success');
      } else {
        await api.post('/categories', data);
        toast('Categoría creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar la categoría', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      toast('Categoría eliminada', 'success');
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
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categorías registradas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Nombre', 'Slug', 'Productos', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
                      <Tags className="w-4 h-4 text-[#C8FF00]" />
                    </div>
                    <span className="font-medium text-gray-900">{cat.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{cat.slug}</code>
                </td>
                <td className="px-6 py-3.5 text-gray-500">{cat._count?.products ?? '—'}</td>
                <td className="px-6 py-3.5"><ActiveBadge active={cat.isActive} /></td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Tags className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay categorías aún</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar categoría' : 'Nueva categoría'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
              placeholder="Ej: Palas"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            <p className="text-xs text-gray-400 mt-1">El slug se generará automáticamente.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="catActive" {...register('isActive')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="catActive" className="text-sm text-gray-700">Categoría activa</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
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
        title="Eliminar categoría"
        description={`¿Eliminar "${deleteTarget?.name}"? Los productos vinculados quedarán sin categoría.`}
        isLoading={deleting}
      />
    </div>
  );
}

const MOCK: Category[] = [
  { id: '1', name: 'Palas', slug: 'palas', isActive: true, _count: { products: 24 } },
  { id: '2', name: 'Zapatillas', slug: 'zapatillas', isActive: true, _count: { products: 18 } },
  { id: '3', name: 'Pelotas', slug: 'pelotas', isActive: true, _count: { products: 7 } },
  { id: '4', name: 'Indumentaria', slug: 'indumentaria', isActive: false, _count: { products: 12 } },
  { id: '5', name: 'Accesorios', slug: 'accesorios', isActive: true, _count: { products: 35 } },
];
