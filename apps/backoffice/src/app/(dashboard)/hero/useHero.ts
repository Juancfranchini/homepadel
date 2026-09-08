import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export interface HeroSlide {
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
export type FormData = z.infer<typeof schema>;

export function useHero() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<HeroSlide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
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
      const res = await api.get('/hero-slides/admin/all');
      const data = res.data?.value || res.data?.data || res.data;
      setSlides(Array.isArray(data) ? [...data].sort((a: HeroSlide, b: HeroSlide) => a.order - b.order) : []);
    } catch { setSlides([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

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
      const payload = { ...data, image: data.image || '', imageMobile: data.imageMobile || '' };
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

  const filtered = slides.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.subtitle || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, currentPage, setCurrentPage, isMobile, openCreate, openEdit, onSubmit, toggleActive,
    handleDelete, filtered, totalPages, paginated,
  };
}
