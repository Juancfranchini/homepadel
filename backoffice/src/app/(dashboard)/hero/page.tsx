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

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageMobile?: string;
  ctaPrimary?: string;
  ctaPrimaryUrl?: string;
  ctaSecondary?: string;
  ctaSecondaryUrl?: string;
  order: number;
  active: boolean;
}

const schema = z.object({
  title: z.string().min(2, 'El titulo es requerido'),
  subtitle: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  image: z.string().optional().or(z.literal('')),
  imageMobile: z.string().optional().or(z.literal('')),
  ctaPrimary: z.string().optional().or(z.literal('')),
  ctaPrimaryUrl: z.string().optional().or(z.literal('')),
  ctaSecondary: z.string().optional().or(z.literal('')),
  ctaSecondaryUrl: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function HeroPage() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<HeroSlide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const imageDesktop = watch('image') || '';
  const imageMobile = watch('imageMobile') || '';
  const isActive = watch('active');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/hero-slides/admin/all');
      const data = res.data?.value || res.data?.data || res.data;
      setSlides(Array.isArray(data) ? [...data].sort((a: HeroSlide, b: HeroSlide) => a.order - b.order) : []);
    } catch { setSlides([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ title: '', subtitle: '', description: '', image: '', imageMobile: '', ctaPrimary: '', ctaPrimaryUrl: '', ctaSecondary: '', ctaSecondaryUrl: '', order: slides.length + 1, active: true });
    setModalOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditItem(s);
    reset({
      title: s.title, subtitle: s.subtitle || '', description: s.description || '',
      image: s.image || '', imageMobile: s.imageMobile || '',
      ctaPrimary: s.ctaPrimary || '', ctaPrimaryUrl: s.ctaPrimaryUrl || '',
      ctaSecondary: s.ctaSecondary || '', ctaSecondaryUrl: s.ctaSecondaryUrl || '',
      order: s.order, active: s.active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        image: data.image || '',
        imageMobile: data.imageMobile || '',
      };
      if (editItem) { await api.patch('/hero-slides/' + editItem.id, payload); toast('Slide actualizado', 'success'); }
      else { await api.post('/hero-slides', payload); toast('Slide creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar el slide', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (s: HeroSlide) => {
    try { await api.patch('/hero-slides/' + s.id, { active: !s.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/hero-slides/' + deleteTarget.id); toast('Slide eliminado', 'success'); setDeleteTarget(null); load(); }
    catch (err: any) { toast(err?.response?.data?.message || 'Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slider</h1>
          <p className="text-gray-500 text-sm mt-0.5">{slides.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nuevo slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron slides</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Subtitulo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((s) => {
                const imgSrc = getImageUrl(s.image);
                return (
                  <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-sm font-bold text-gray-400">{s.order}</td>
                    <td className="px-4 py-3">
                      {imgSrc ? (
                        <img src={imgSrc} alt={s.title} className="w-24 h-12 object-cover rounded border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-24 h-12 rounded bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                      )}
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{s.title}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell"><p className="text-gray-500 text-sm">{s.subtitle || '-'}</p></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Toggle checked={s.active} onChange={() => toggleActive(s)} />
                        <span className={'text-xs font-medium ' + (s.active ? 'text-green-600' : 'text-gray-400')}>{s.active ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar slide' : 'Nuevo slide'} size="xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-0">
            <div className="flex-shrink-0 flex flex-col gap-4" style={{ width: 200 }}>
              <div>
                <p className={labelClass + ' mb-2'}>Desktop</p>
                <ImageUpload value={imageDesktop} onChange={(url) => setValue('image', url, { shouldDirty: true })} placeholder="URL desktop" width={200} height={80} />
              </div>
              <div>
                <p className={labelClass + ' mb-2'}>Mobile</p>
                <ImageUpload value={imageMobile} onChange={(url) => setValue('imageMobile', url, { shouldDirty: true })} placeholder="URL mobile" width={200} height={80} />
              </div>
            </div>

            <div className="mx-6 w-px bg-gray-200 self-stretch my-2" />

            <div className="flex-1 grid grid-cols-2 gap-4 content-start">
              <div className="col-span-2">
                <label className={labelClass}>Titulo *</label>
                <input {...register('title')} className={inputClass + ' mt-1'} placeholder="NUEVA COLECCION 2026" />
                {errors.title && <p className="text-xs text-red-600 mt-0.5">{errors.title.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Subtitulo (chip verde)</label>
                <input {...register('subtitle')} className={inputClass + ' mt-1'} placeholder="Nueva Temporada" />
              </div>
              <div>
                <label className={labelClass}>Orden</label>
                <input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Descripcion</label>
                <textarea {...register('description')} rows={2} className={inputClass + ' mt-1'} placeholder="Texto descriptivo bajo el titulo..." />
              </div>
              <div>
                <label className={labelClass}>CTA Principal - Texto</label>
                <input {...register('ctaPrimary')} className={inputClass + ' mt-1'} placeholder="VER COLECCION" />
              </div>
              <div>
                <label className={labelClass}>CTA Principal - URL</label>
                <input {...register('ctaPrimaryUrl')} className={inputClass + ' mt-1'} placeholder="/catalogo" />
              </div>
              <div>
                <label className={labelClass}>CTA Secundario - Texto</label>
                <input {...register('ctaSecondary')} className={inputClass + ' mt-1'} placeholder="VER OFERTAS" />
              </div>
              <div>
                <label className={labelClass}>CTA Secundario - URL</label>
                <input {...register('ctaSecondaryUrl')} className={inputClass + ' mt-1'} placeholder="/catalogo?oferta=1" />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <div className="flex items-center gap-2 mt-1">
                  <Toggle checked={isActive} onChange={() => setValue('active', !isActive, { shouldDirty: true })} />
                  <span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>{isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
                  {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar slide" description={'Eliminar el slide "' + (deleteTarget?.title || '') + '"?'} isLoading={deleting} />
    </div>
  );
}
