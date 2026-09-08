import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export interface Banner {
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
  title: z.string().min(2, 'El título es requerido'),
  subtitle: z.string().optional().or(z.literal('')),
  image: z.string().optional().or(z.literal('')),
  imageMobile: z.string().optional().or(z.literal('')),
  ctaText: z.string().optional(),
  link: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});
export type FormData = z.infer<typeof schema>;

export function useBanners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset } = form;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners?showAll=1');
      const data = res.data?.value || res.data?.data || res.data;
      setBanners(Array.isArray(data) ? [...data].sort((a: Banner, b: Banner) => a.order - b.order) : []);
    } catch { setBanners([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const openCreate = () => {
    setEditItem(null);
    reset({ title: '', subtitle: '', image: '', imageMobile: '', ctaText: '', link: '', order: banners.length + 1, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditItem(b);
    reset({ title: b.title, subtitle: b.subtitle || '', image: b.image || '', imageMobile: b.imageMobile || '', ctaText: b.ctaText || '', link: b.link || '', order: b.order, isActive: b.active });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        title: data.title, subtitle: data.subtitle || '', image: data.image || '', imageMobile: data.imageMobile || '',
        ctaText: data.ctaText || '', link: data.link || '', order: data.order, active: data.isActive,
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

  const filtered = banners.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.subtitle || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, currentPage, setCurrentPage, isMobile, openCreate, openEdit, onSubmit, toggleActive,
    handleDelete, filtered, totalPages, paginated,
  };
}
