'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ImageIcon, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';
import ImageUpload, { getImageUrl } from '@/components/ui/ImageUpload';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageMobile?: string;
  ctaText?: string;
  link?: string;
  order: number;
  active: boolean;
}

const schema = z.object({
  title: z.string().min(2, 'El titulo es requerido'),
  subtitle: z.string().optional().or(z.literal('')),
  image: z.string().optional().or(z.literal('')),
  imageMobile: z.string().optional().or(z.literal('')),
  ctaText: z.string().optional(),
  link: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function BannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const imageDesktop = watch('image') || '';
  const imageMobile = watch('imageMobile') || '';
  const isActive = watch('isActive');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners?showAll=1');
      const data = res.data?.value || res.data?.data || res.data;
      setBanners(Array.isArray(data) ? [...data].sort((a: Banner, b: Banner) => a.order - b.order) : []);
    } catch { setBanners([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ title: '', subtitle: '', image: '', imageMobile: '', ctaText: '', link: '', order: banners.length + 1, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditItem(b);
    reset({
      title: b.title, subtitle: b.subtitle || '', image: b.image || '', imageMobile: b.imageMobile || '',
      ctaText: b.ctaText || '', link: b.link || '', order: b.order, isActive: b.active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        title: data.title,
        subtitle: data.subtitle || '',
        image: data.image || '',
        imageMobile: data.imageMobile || '',
        ctaText: data.ctaText || '',
        link: data.link || '',
        order: data.order,
        active: data.isActive,
      };
      if (editItem) { await api.patch('/banners/' + editItem.id, payload); toast('Banner actualizado', 'success'); }
      else { await api.post('/banners', payload); toast('Banner creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar el banner', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (b: Banner) => {
    try { await api.patch('/banners/' + b.id, { active: !b.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/banners/' + deleteTarget.id); toast('Banner eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm mt-0.5">{banners.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nuevo banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron banners</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Subtitulo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Link</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => {
                const imgSrc = getImageUrl(b.image);
                return (
                  <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-sm font-bold text-gray-400">{b.order}</td>
                    <td className="px-4 py-3">
                      {imgSrc ? (
                        <img src={imgSrc} alt={b.title} className="w-24 h-12 object-cover rounded border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-24 h-12 rounded bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                      )}
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{b.title}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell"><p className="text-gray-500 text-sm">{b.subtitle || '-'}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {b.link ? (
                        <a href={b.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                          <ExternalLink className="w-3 h-3" />{b.link.length > 30 ? b.link.slice(0, 30) + '...' : b.link}
                        </a>
                      ) : <span className="text-gray-400 text-xs">-</span>}
                    </td>
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
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar banner' : 'Nuevo banner'} size="xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-0">
            <div className="flex-shrink-0 flex flex-col gap-4" style={{ width: 200 }}>
              <div>
                <p className={labelClass + ' mb-2'}>Desktop</p>
                <ImageUpload value={imageDesktop} onChange={(url) => setValue('image', url, { shouldDirty: true })} placeholder="URL desktop" width={200} height={100} />
              </div>
              <div>
                <p className={labelClass + ' mb-2'}>Mobile</p>
                <ImageUpload value={imageMobile} onChange={(url) => setValue('imageMobile', url, { shouldDirty: true })} placeholder="URL mobile" width={200} height={100} />
              </div>
            </div>

            <div className="mx-6 w-px bg-gray-200 self-stretch my-2" />

            <div className="flex-1 grid grid-cols-2 gap-4 content-start">
              <div>
                <label className={labelClass}>Titulo *</label>
                <input {...register('title')} className={inputClass + ' mt-1'} placeholder="Ej: Promo de verano" />
                {errors.title && <p className="text-xs text-red-600 mt-0.5">{errors.title.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Subtitulo</label>
                <input {...register('subtitle')} className={inputClass + ' mt-1'} placeholder="Ej: Zapatillas premium" />
              </div>
              <div>
                <label className={labelClass}>Texto del boton</label>
                <input {...register('ctaText')} className={inputClass + ' mt-1'} placeholder="VER OFERTA" />
              </div>
              <div>
                <label className={labelClass}>Orden</label>
                <input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Link de destino</label>
                <input {...register('link')} className={inputClass + ' mt-1'} placeholder="https://..." />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <div className="flex items-center gap-2 mt-1">
                  <Toggle checked={isActive} onChange={() => setValue('isActive', !isActive, { shouldDirty: true })} />
                  <span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>{isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar banner" description={'Eliminar el banner "' + (deleteTarget?.title || '') + '"?'} isLoading={deleting} />
    </div>
  );
}
