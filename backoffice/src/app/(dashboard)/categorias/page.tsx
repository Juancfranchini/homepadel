'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Upload, ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  order?: number;
  active: boolean;
  _count?: { products: number };
}

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  image: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function CategoriasPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const imageUrl = watch('image');
  const previewUrl = getImageUrl(imageUrl);
  const isActive = watch('isActive');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      const data = res.data?.value || res.data?.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', order: 0, isActive: true, image: '' });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditItem(c);
    reset({ name: c.name, order: c.order ?? 0, isActive: c.active, image: c.image || '' });
    setModalOpen(true);
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.url || res.data?.imageUrl || '';
        setValue('image', url, { shouldDirty: true });
      } catch {} finally { setUploading(false); }
    };
    input.click();
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        order: data.order,
        active: data.isActive,
        ...(data.image ? { image: data.image } : {}),
      };
      if (editItem) {
        await api.patch('/categories/' + editItem.id, payload);
        toast('Categoria actualizada', 'success');
      } else {
        await api.post('/categories', payload);
        toast('Categoria creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar la categoria', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Category) => {
    try {
      await api.patch('/categories/' + c.id, { active: !c.active });
      toast('Actualizado', 'success');
      load();
    } catch {
      toast('Error', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete('/categories/' + deleteTarget.id);
      toast('Categoria eliminada', 'success');
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} registros</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-4 h-4" />Nueva categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No se encontraron categorias</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Productos</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const imgSrc = getImageUrl(cat.image);
                return (
                  <tr key={cat.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={cat.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium text-sm">{cat.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{cat.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500 hidden md:table-cell">
                      {cat._count?.products ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Toggle checked={cat.active} onChange={() => toggleActive(cat)} />
                        <span className={'text-xs font-medium ' + (cat.active ? 'text-green-600' : 'text-gray-400')}>
                          {cat.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar categoria' : 'Nueva categoria'} size="xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-0">
            <div className="flex-shrink-0 w-[200px] flex flex-col gap-3">
              <div className="w-full h-[200px] rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="flex gap-2">
                <input
                  {...register('image')}
                  className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
                  placeholder="URL de imagen"
                />
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
                </button>
              </div>
            </div>

            <div className="mx-6 w-px bg-gray-200 self-stretch my-2" />

            <div className="flex-1 grid grid-cols-2 gap-4 content-start">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input {...register('name')} className={inputClass + ' mt-1'} placeholder="Ej: Palas" />
                {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Orden</label>
                <input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <div className="flex items-center gap-2 mt-1">
                  <Toggle
                    checked={isActive}
                    onChange={() => setValue('isActive', !isActive, { shouldDirty: true })}
                  />
                  <span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
                  {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar categoria"
        description={'Eliminar "' + (deleteTarget?.name || '') + '"? Los productos vinculados quedaran sin categoria.'}
        isLoading={deleting}
      />
    </div>
  );
}
