import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';
import { AdvancedFilters } from './components/AdvancedSearchModal';

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  photo?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  photo: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
export type FormData = z.infer<typeof schema>;

export function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function useFilteredSorted(testimonials: Testimonial[], search: string, advancedFilters: AdvancedFilters | null, sortField: string, sortDir: 'asc' | 'desc') {
  const filtered = testimonials.filter(t => {
    const matchName = t.name.toLowerCase().includes(search.toLowerCase());
    if (!advancedFilters) return matchName;
    const matchRating = advancedFilters.rating ? t.rating === advancedFilters.rating : true;
    const matchActive = advancedFilters.active !== null ? t.active === advancedFilters.active : true;
    const matchDateFrom = advancedFilters.dateFrom ? new Date(t.createdAt) >= new Date(advancedFilters.dateFrom) : true;
    const matchDateTo = advancedFilters.dateTo ? new Date(t.createdAt) <= new Date(advancedFilters.dateTo + 'T23:59:59') : true;
    return matchName && matchRating && matchActive && matchDateFrom && matchDateTo;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || '';
    const bVal = (b as any)[sortField] || '';
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      return sortDir === 'asc' ? new Date(aVal).getTime() - new Date(bVal).getTime() : new Date(bVal).getTime() - new Date(aVal).getTime();
    }
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  return { filtered, sorted };
}

function useTestimonialsData() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/testimonials/admin/all');
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setTestimonials([...data].sort((a: Testimonial, b: Testimonial) => a.order - b.order));
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { testimonials, loading, load };
}

export function useTestimonios() {
  const { toast } = useToast();
  const { testimonials, loading, load } = useTestimonialsData();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Testimonial | null>(null);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset } = form;

  const openCreate = () => { setEditItem(null); reset({ active: true, order: testimonials.length + 1, rating: 5 }); setModalOpen(true); };
  const openEdit = (t: Testimonial) => { setEditItem(t); reset({ name: t.name, comment: t.comment, rating: t.rating, photo: t.photo ?? '', order: t.order, active: t.active }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/testimonials/' + editItem.id, data); toast('Testimonio actualizado', 'success'); }
      else { await api.post('/testimonials', data); toast('Testimonio creado', 'success'); }
      setModalOpen(false);
      load();
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete('/testimonials/' + deleteTarget.id);
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
      await api.patch('/testimonials/' + t.id, { active: !t.active });
      toast(t.active ? 'Testimonio ocultado' : 'Testimonio activado', 'success');
      load();
    } catch {
      toast('Error al cambiar estado', 'error');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const { filtered, sorted } = useFilteredSorted(testimonials, search, advancedFilters, sortField, sortDir);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  return {
    form, loading, modalOpen, setModalOpen, detailItem, setDetailItem, editItem, deleteTarget, setDeleteTarget,
    deleting, saving, search, setSearch, advancedOpen, setAdvancedOpen, advancedFilters, setAdvancedFilters, sortField,
    safeCurrentPage, setCurrentPage, totalPages, openCreate, openEdit, onSubmit, handleDelete, toggleActive,
    handleSort, filtered, paginated,
  };
}
