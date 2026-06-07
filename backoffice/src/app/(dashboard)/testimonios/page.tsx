'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, MessageSquare, Star, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  photo?: string;
  order: number;
  active: boolean;
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  photo: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function TestimoniosPage() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/testimonials/admin/all');
      const data = (Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
      setTestimonials([...data].sort((a: Testimonial, b: Testimonial) => a.order - b.order));
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ active: true, order: testimonials.length + 1, rating: 5 });
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditItem(t);
    reset({
      name: t.name,
      comment: t.comment,
      rating: t.rating,
      photo: t.photo ?? '',
      order: t.order,
      active: t.active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/testimonials/${editItem.id}`, data);
        toast('Testimonio actualizado', 'success');
      } else {
        await api.post('/testimonials', data);
        toast('Testimonio creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar el testimonio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/testimonials/${deleteTarget.id}`);
      toast('Testimonio eliminado', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (t: Testimonial) => {
    try {
      await api.patch(`/testimonials/${t.id}`, { active: !t.active });
      toast(t.active ? 'Testimonio ocultado' : 'Testimonio activado', 'success');
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
          <h1 className="text-2xl font-bold text-gray-900">Testimonios</h1>
          <p className="text-gray-500 text-sm mt-0.5">Reseñas de clientes — {testimonials.length} registradas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo testimonio
        </button>
      </div>

      {/* Cards grid */}
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No hay testimonios cargados</p>
          <button onClick={openCreate} className="mt-4 text-sm font-semibold text-[#C8FF00] bg-[#0f172a] px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors">
            Agregar el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
              {/* Rating + estado */}
              <div className="flex items-center justify-between">
                <StarRating rating={t.rating} />
                <ActiveBadge active={t.active} />
              </div>

              {/* Comentario */}
              <p className="text-gray-700 text-sm leading-relaxed flex-1 line-clamp-4">
                &ldquo;{t.comment}&rdquo;
              </p>

              {/* Autor */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#0f172a] flex items-center justify-center shrink-0">
                    <span className="text-[#C8FF00] font-black text-xs">{t.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{t.name}</p>
                  <p className="text-xs text-gray-400">Orden #{t.order}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(t)}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                    t.active ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {t.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {t.active ? 'Ocultar' : 'Mostrar'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
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
        title={editItem ? 'Editar testimonio' : 'Nuevo testimonio'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente *</label>
            <input {...register('name')} className={inputClass} placeholder="Ej: Martín R." />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario *</label>
            <textarea {...register('comment')} rows={4} className={inputClass} placeholder="Excelentes productos y atención..." />
            {errors.comment && <p className="text-xs text-red-600 mt-1">{errors.comment.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1 a 5 estrellas)</label>
            <select {...register('rating')} className={inputClass}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{'⭐'.repeat(r)} — {r} estrella{r > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
            <input {...register('photo')} className={inputClass} placeholder="https://..." />
            <p className="text-xs text-gray-400 mt-0.5">Opcional. Si no hay foto se muestra el avatar con iniciales.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input type="number" min={0} {...register('order')} className={inputClass} />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="tActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="tActive" className="text-sm text-gray-700">Testimonio visible en el sitio</label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
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
        title="Eliminar testimonio"
        description={`¿Eliminar el testimonio de "${deleteTarget?.name}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

