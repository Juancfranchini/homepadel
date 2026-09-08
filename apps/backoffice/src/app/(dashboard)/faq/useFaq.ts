import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';
import { FaqAdvancedFilters } from './components/FaqAdvancedSearchModal';

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

const schema = z.object({
  category: z.string().default('GENERAL'),
  question: z.string().min(5, 'La pregunta es requerida'),
  answer: z.string().min(10, 'La respuesta debe tener al menos 10 caracteres'),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
export type FormData = z.infer<typeof schema>;

export function useFaq() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<FaqItem | null>(null);
  const [editItem, setEditItem] = useState<FaqItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FaqAdvancedFilters | null>(null);
  const [sortField, setSortField] = useState<string>('order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;
  const [categories, setCategories] = useState(['COMPRAS', 'ENVÍOS', 'PAGOS', 'DEVOLUCIONES', 'PRODUCTOS', 'GENERAL']);
  const [showCategories, setShowCategories] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset } = form;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/faq/admin/all');
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setFaqs([...data].sort((a: FaqItem, b: FaqItem) => a.order - b.order));
    } catch { setFaqs([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const openCreate = () => { setEditItem(null); reset({ active: true, order: faqs.length + 1, category: 'GENERAL' }); setModalOpen(true); };
  const openEdit = (t: FaqItem) => { setEditItem(t); reset({ category: t.category || 'GENERAL', question: t.question, answer: t.answer, order: t.order, active: t.active }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/faq/' + editItem.id, data); toast('FAQ actualizada', 'success'); }
      else { await api.post('/faq', data); toast('FAQ creada', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/faq/' + deleteTarget.id); toast('FAQ eliminada', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  const toggleActive = async (t: FaqItem) => {
    try { await api.patch('/faq/' + t.id, { active: !t.active }); toast(t.active ? 'FAQ ocultada' : 'FAQ activada', 'success'); load(); }
    catch { toast('Error al cambiar estado', 'error'); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const filtered = faqs.filter(t => {
    const matchSearch = t.question.toLowerCase().includes(search.toLowerCase()) || t.answer.toLowerCase().includes(search.toLowerCase());
    if (!advancedFilters) return matchSearch;
    const matchCat = advancedFilters.category ? t.category === advancedFilters.category : true;
    const matchActive = advancedFilters.active !== null ? t.active === advancedFilters.active : true;
    return matchSearch && matchCat && matchActive;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || ''; const bVal = (b as any)[sortField] || '';
    if (sortField === 'order') return sortDir === 'asc' ? (a.order - b.order) : (b.order - a.order);
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    form, faqs, loading, modalOpen, setModalOpen, detailItem, setDetailItem, editItem, deleteTarget, setDeleteTarget,
    deleting, saving, search, setSearch, advancedOpen, setAdvancedOpen, advancedFilters, setAdvancedFilters,
    sortField, currentPage, setCurrentPage, categories, setCategories, showCategories, setShowCategories,
    openCreate, openEdit, onSubmit, handleDelete, toggleActive, handleSort, totalPages, paginated,
  };
}
