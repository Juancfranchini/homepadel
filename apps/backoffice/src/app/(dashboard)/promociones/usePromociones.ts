import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount: number;
  ctaText?: string;
  ctaUrl?: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const schema = z.object({
  title: z.string().min(2, 'Título requerido'),
  description: z.string().optional().or(z.literal('')),
  discount: z.coerce.number().min(1, 'Descuento requerido'),
  ctaText: z.string().optional().or(z.literal('')),
  ctaUrl: z.string().optional().or(z.literal('')),
  startDate: z.string().min(1, 'Fecha requerida'),
  endDate: z.string().min(1, 'Fecha requerida'),
  active: z.boolean().default(true),
});
export type FormData = z.infer<typeof schema>;

export function usePromociones() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
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
      const res = await api.get('/promotions');
      const data = res.data?.value || res.data?.data || res.data;
      setPromotions(Array.isArray(data) ? data : []);
    } catch { setPromotions([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const openCreate = () => { setEditItem(null); reset({ title: '', description: '', discount: 10, ctaText: '', ctaUrl: '', startDate: '', endDate: '', active: true }); setModalOpen(true); };
  const openEdit = (p: Promotion) => { setEditItem(p); reset({ title: p.title, description: p.description || '', discount: p.discount, ctaText: p.ctaText || '', ctaUrl: p.ctaUrl || '', startDate: p.startDate.slice(0, 10), endDate: p.endDate.slice(0, 10), active: p.active }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { ...data, startDate: new Date(data.startDate).toISOString(), endDate: new Date(data.endDate).toISOString() };
      if (editItem) { await api.patch('/promotions/' + editItem.id, payload); toast('Promoción actualizada', 'success'); }
      else { await api.post('/promotions', payload); toast('Promoción creada', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (p: Promotion) => {
    try { await api.patch('/promotions/' + p.id, { active: !p.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/promotions/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  const filtered = promotions.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, currentPage, setCurrentPage, openCreate, openEdit, onSubmit, toggleActive, handleDelete,
    filtered, totalPages, paginated,
  };
}
