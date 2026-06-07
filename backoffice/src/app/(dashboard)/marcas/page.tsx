// Brands (Marcas) management page for the Home Pádel BackOffice.
// Full CRUD: list, create/edit via modal, delete with confirmation.
// API: GET/POST/PUT/DELETE /api/brands

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  logoUrl?: string;
  url?: string;
  order?: number;
  _count?: { products: number };
}

// ─── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MarcasPage() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      setBrands(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch {
      setBrands(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', url: '', order: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditItem(b);
    reset({ name: b.name, url: b.url ?? '', order: b.order ?? 0, isActive: b.isActive });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/brands/${editItem.id}`, data);
        toast('Marca actualizada', 'success');
      } else {
        await api.post('/brands', data);
        toast('Marca creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar la marca', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/brands/${deleteTarget.id}`);
      toast('Marca eliminada', 'success');
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
          <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} marcas registradas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva marca
        </button>
      </div>

      {/* Grid of brand cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-14 h-14 rounded-xl bg-[#0f172a] flex items-center justify-center">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 object-contain" />
              ) : (
                <Award className="w-6 h-6 text-[#C8FF00]" />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm">{brand.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{brand._count?.products ?? 0} productos</p>
            </div>
            <ActiveBadge active={brand.isActive} />
            <div className="flex gap-2 w-full">
              <button
                onClick={() => openEdit(brand)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-100 hover:bg-blue-50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setDeleteTarget(brand)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Also a compact table view */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Vista de tabla</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Nombre', 'Slug', 'Productos', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-900">{b.name}</td>
                <td className="px-6 py-3"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{b.slug}</code></td>
                <td className="px-6 py-3 text-gray-500">{b._count?.products ?? '—'}</td>
                <td className="px-6 py-3"><ActiveBadge active={b.isActive} /></td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar marca' : 'Nueva marca'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
              placeholder="Ej: Bullpadel"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del sitio web</label>
            <input
              {...register('url')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
              placeholder="https://bullpadel.com"
            />
            {errors.url && <p className="text-xs text-red-600 mt-1">{errors.url.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Opcional — el logo del slider enlazará a esta URL.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden en el slider</label>
            <input
              type="number"
              min={0}
              {...register('order')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
            />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="brandActive" {...register('isActive')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="brandActive" className="text-sm text-gray-700">Marca activa</label>
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
        title="Eliminar marca"
        description={`¿Eliminar "${deleteTarget?.name}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

const MOCK: Brand[] = [
  { id: '1', name: 'Bullpadel', slug: 'bullpadel', isActive: true, _count: { products: 24 } },
  { id: '2', name: 'Nox', slug: 'nox', isActive: true, _count: { products: 18 } },
  { id: '3', name: 'Dunlop', slug: 'dunlop', isActive: true, _count: { products: 7 } },
  { id: '4', name: 'Adidas', slug: 'adidas', isActive: true, _count: { products: 15 } },
  { id: '5', name: 'Wilson', slug: 'wilson', isActive: false, _count: { products: 9 } },
];

