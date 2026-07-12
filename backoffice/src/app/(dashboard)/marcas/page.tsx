'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';
import ImageUpload, { getImageUrl } from '@/components/ui/ImageUpload';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  logoUrl?: string | null;
  url?: string;
  order?: number;
  active?: boolean;
  isActive?: boolean;
  _count?: { products: number };
}

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  url: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  logo: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function MarcasPage() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const logoValue = watch('logo') || '';
  const isActive = watch('isActive');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      const data = res.data?.value || res.data?.data || res.data;
      setBrands(Array.isArray(data) ? data : []);
    } catch { setBrands([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', url: '', order: 0, isActive: true, logo: '' });
    setModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditItem(b);
    reset({ name: b.name, url: b.url ?? '', order: b.order ?? 0, isActive: b.active ?? b.isActive ?? true, logo: b.logo || b.logoUrl || '' });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { name: data.name, url: data.url || undefined, order: data.order, active: data.isActive, ...(data.logo ? { logo: data.logo } : {}) };
      if (editItem) { await api.patch('/brands/' + editItem.id, payload); toast('Marca actualizada', 'success'); }
      else { await api.post('/brands', payload); toast('Marca creada', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar la marca', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (b: Brand) => {
    try { await api.patch('/brands/' + b.id, { active: !(b.active ?? b.isActive) }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/brands/' + deleteTarget.id); toast('Marca eliminada', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  const isBrandActive = (b: Brand) => b.active ?? b.isActive ?? false;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Marcas</h1><p className="text-gray-500 text-sm mt-0.5">{brands.length} registros</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"><Plus className="w-4 h-4" />Nueva marca</button>
      </div>

      {brands.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron marcas</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Productos</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr></thead>
            <tbody>
              {brands.map((b) => {
                const imgSrc = getImageUrl(b.logo || b.logoUrl);
                return (
                  <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {imgSrc ? <img src={imgSrc} alt={b.name} className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>}
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{b.name}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{b.slug}</code></td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500 hidden md:table-cell">{b._count?.products ?? '-'}</td>
                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-2"><Toggle checked={isBrandActive(b)} onChange={() => toggleActive(b)} /><span className={'text-xs font-medium ' + (isBrandActive(b) ? 'text-green-600' : 'text-gray-400')}>{isBrandActive(b) ? 'Activo' : 'Inactivo'}</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button><button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar marca' : 'Nueva marca'} size="xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-0">
            <ImageUpload value={logoValue} onChange={(url) => setValue('logo', url, { shouldDirty: true })} placeholder="URL del logo" />
            <div className="mx-6 w-px bg-gray-200 self-stretch my-2" />
            <div className="flex-1 grid grid-cols-2 gap-4 content-start">
              <div><label className={labelClass}>Nombre *</label><input {...register('name')} className={inputClass + ' mt-1'} placeholder="Ej: Bullpadel" />{errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>}</div>
              <div><label className={labelClass}>Sitio Web</label><input {...register('url')} className={inputClass + ' mt-1'} placeholder="https://bullpadel.com" /></div>
              <div><label className={labelClass}>Orden</label><input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} /></div>
              <div><label className={labelClass}>Estado</label><div className="flex items-center gap-2 mt-1"><Toggle checked={isActive} onChange={() => setValue('isActive', !isActive, { shouldDirty: true })} /><span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>{isActive ? 'Activo' : 'Inactivo'}</span></div></div>
              <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button><button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button></div>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar marca" description={'Eliminar "' + (deleteTarget?.name || '') + '"? Los productos vinculados quedaran sin marca.'} isLoading={deleting} />
    </div>
  );
}
