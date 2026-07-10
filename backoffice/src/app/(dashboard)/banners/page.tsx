// Banners management page for the Home Pádel BackOffice.
// CRUD: list with image preview and order field, create/edit with image upload, delete.
// API: GET/POST/PUT/DELETE /api/banners

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ImageIcon, ExternalLink, GripVertical } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Banner {
  id: string;
  title: string;
  image?: string;       // campo real en la API
  imageMobile?: string;
  ctaText?: string;
  link?: string;
  order: number;
  active: boolean;      // campo real en la API
}

// ─── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  imageUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  imageMobile: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  ctaText: z.string().optional(),
  link: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners?showAll=1');  // ver todos los banners, incluyendo inactivos
      const data = (Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
      setBanners([...data].sort((a: Banner, b: Banner) => a.order - b.order));
    } catch {
      setBanners(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ isActive: true, order: banners.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditItem(b);
    reset({
      title: b.title,
      imageUrl: b.image ?? '',         // API devuelve 'image', el form usa 'imageUrl'
      imageMobile: b.imageMobile ?? '',
      ctaText: b.ctaText ?? '',
      link: b.link ?? '',
      order: b.order,
      isActive: b.active,             // API devuelve 'active', el form usa 'isActive'
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/banners/${editItem.id}`, data);
        toast('Banner actualizado', 'success');
      } else {
        await api.post('/banners', data);
        toast('Banner creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar el banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/banners/${deleteTarget.id}`);
      toast('Banner eliminado', 'success');
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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm mt-0.5">{banners.length} banners registrados — ordenados por prioridad</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00]"
        >
          <Plus className="w-4 h-4" />
          Nuevo banner
        </button>
      </div>

      {/* Preview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
            {/* Image */}
            <div className="aspect-[16/6] bg-gray-100 relative">
              {b.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="absolute top-2 left-2 bg-[#0f172a]/80 text-white text-xs px-2 py-1 rounded-full font-semibold">
                #{b.order}
              </div>
              <div className="absolute top-2 right-2">
                <ActiveBadge active={b.active} />
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{b.title}</p>
                  {b.link && (
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-0.5 truncate"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {b.link}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Vista de tabla</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Orden', 'Imagen', 'Título', 'Link', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {banners.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    <span className="font-bold text-gray-700 w-6 text-center">{b.order}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image} alt={b.title} className="w-20 h-10 object-cover rounded-lg border border-gray-100" />
                  ) : (
                    <div className="w-20 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{b.title}</td>
                <td className="px-4 py-3 text-sm text-blue-500 max-w-[200px] truncate">{b.link ?? '—'}</td>
                <td className="px-4 py-3"><ActiveBadge active={b.active} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar banner' : 'Nuevo banner'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input {...register('title')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="Ej: Promo de verano" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen desktop (URL)</label>
            <input {...register('imageUrl')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="https://..." />
            {errors.imageUrl && <p className="text-xs text-red-600 mt-1">{errors.imageUrl.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Recomendado: 1920×600px</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen mobile (URL)</label>
            <input {...register('imageMobile')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="https://..." />
            {errors.imageMobile && <p className="text-xs text-red-600 mt-1">{errors.imageMobile.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Recomendado: 768×500px — opcional</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto del botón CTA</label>
            <input {...register('ctaText')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="VER OFERTA" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link (URL de destino)</label>
            <input {...register('link')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" placeholder="https://..." />
            {errors.link && <p className="text-xs text-red-600 mt-1">{errors.link.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input type="number" min={1} {...register('order')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="bannerActive" {...register('isActive')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="bannerActive" className="text-sm text-gray-700">Banner activo</label>
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
        title="Eliminar banner"
        description={`¿Eliminar el banner "${deleteTarget?.title}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

const MOCK: Banner[] = [
  { id: '1', title: 'Banner principal — Verano', image: 'https://via.placeholder.com/800x300/0f172a/C8FF00?text=HOME+PADEL', link: '/promociones', order: 1, active: true },
  { id: '2', title: 'Nuevas palas 2025', image: 'https://via.placeholder.com/800x300/1e293b/ffffff?text=Palas+2025', link: '/productos', order: 2, active: true },
  { id: '3', title: 'Black Friday', order: 3, active: false },
];

