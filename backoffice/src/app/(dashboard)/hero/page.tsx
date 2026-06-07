'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, GripVertical, PlaySquare, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  imageMobile: z.string().optional(),
  ctaPrimary: z.string().optional(),
  ctaPrimaryUrl: z.string().optional(),
  ctaSecondary: z.string().optional(),
  ctaSecondaryUrl: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HeroPage() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<HeroSlide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchImage = watch('image');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/hero-slides/admin/all');
      const data = (Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
      setSlides([...data].sort((a: HeroSlide, b: HeroSlide) => a.order - b.order));
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ active: true, order: slides.length + 1 });
    setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditItem(s);
    reset({
      title: s.title,
      subtitle: s.subtitle ?? '',
      description: s.description ?? '',
      image: s.image ?? '',
      imageMobile: s.imageMobile ?? '',
      ctaPrimary: s.ctaPrimary ?? '',
      ctaPrimaryUrl: s.ctaPrimaryUrl ?? '',
      ctaSecondary: s.ctaSecondary ?? '',
      ctaSecondaryUrl: s.ctaSecondaryUrl ?? '',
      order: s.order,
      active: s.active,
    });
    setPreview(s.image ?? null);
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/hero-slides/${editItem.id}`, data);
        toast('Slide actualizado', 'success');
      } else {
        await api.post('/hero-slides', data);
        toast('Slide creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar el slide', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/hero-slides/${deleteTarget.id}`);
      toast('Slide eliminado', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await api.patch(`/hero-slides/${slide.id}`, { active: !slide.active });
      toast(slide.active ? 'Slide desactivado' : 'Slide activado', 'success');
      load();
    } catch {
      toast('Error al cambiar estado', 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slider</h1>
          <p className="text-gray-500 text-sm mt-0.5">{slides.length} slides — se muestran por orden en el inicio</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo slide
        </button>
      </div>

      {/* Cards grid */}
      {slides.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <PlaySquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No hay slides creados aún</p>
          <button onClick={openCreate} className="mt-4 text-sm font-semibold text-[#C8FF00] bg-[#0f172a] px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors">
            Crear el primer slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
              {/* Preview */}
              <div className="aspect-[16/7] bg-[#0f172a] relative overflow-hidden">
                {slide.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0f172a] to-[#1e293b]" />
                )}
                {/* Overlay text */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  {slide.subtitle && (
                    <p className="text-[#C8FF00] text-[10px] font-bold uppercase tracking-widest mb-1">{slide.subtitle}</p>
                  )}
                  <p className="text-white font-black text-sm leading-tight line-clamp-2">{slide.title}</p>
                  {slide.ctaPrimary && (
                    <div className="mt-2 inline-flex">
                      <span className="text-[9px] bg-[#C8FF00] text-[#0f172a] font-black px-2 py-0.5 rounded uppercase">
                        {slide.ctaPrimary}
                      </span>
                    </div>
                  )}
                </div>
                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <GripVertical className="w-3 h-3" />#{slide.order}
                </div>
                <div className="absolute top-2 right-2">
                  <ActiveBadge active={slide.active} />
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
                <button
                  onClick={() => toggleActive(slide)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                    slide.active
                      ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {slide.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {slide.active ? 'Desactivar' : 'Activar'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(slide)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(slide)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar slide' : 'Nuevo slide'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Preview image */}
          {(preview || watchImage) && (
            <div className="aspect-[16/6] rounded-lg overflow-hidden bg-[#0f172a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={watchImage || preview || ''} alt="preview" className="w-full h-full object-cover opacity-70" onError={() => {}} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input {...register('title')} className={inputClass} placeholder="EQUIPAMIENTO DE ALTO RENDIMIENTO" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (chip verde)</label>
              <input {...register('subtitle')} className={inputClass} placeholder="Nueva Temporada 2025" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" min={0} {...register('order')} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea {...register('description')} rows={2} className={inputClass} placeholder="Texto descriptivo bajo el título..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen desktop (URL)</label>
              <input {...register('image')} className={inputClass} placeholder="https://..." onChange={(e) => setPreview(e.target.value)} />
              <p className="text-xs text-gray-400 mt-0.5">Recomendado: 1920×600px</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen mobile (URL)</label>
              <input {...register('imageMobile')} className={inputClass} placeholder="https://..." />
              <p className="text-xs text-gray-400 mt-0.5">Recomendado: 768×500px</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA principal — texto</label>
              <input {...register('ctaPrimary')} className={inputClass} placeholder="VER PALETAS" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA principal — URL</label>
              <input {...register('ctaPrimaryUrl')} className={inputClass} placeholder="/catalogo?categoria=paletas" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA secundario — texto</label>
              <input {...register('ctaSecondary')} className={inputClass} placeholder="VER OFERTAS" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA secundario — URL</label>
              <input {...register('ctaSecondaryUrl')} className={inputClass} placeholder="/catalogo?oferta=1" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="slideActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="slideActive" className="text-sm text-gray-700">Slide activo (visible en el sitio)</label>
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
        title="Eliminar slide"
        description={`¿Eliminar el slide "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        isLoading={deleting}
      />
    </div>
  );
}

