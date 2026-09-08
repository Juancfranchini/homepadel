import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';
import { ReviewsAdvancedFilters } from './components/ReviewsAdvancedSearchModal';

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  active: boolean;
  verified: boolean;
  createdAt: string;
  product?: { id: string; name: string };
}

const schema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  name: z.string().min(2, 'El nombre es requerido'),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
  active: z.boolean().default(true),
  verified: z.boolean().default(true),
});
export type FormData = z.infer<typeof schema>;

function useReviewsExtras() {
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [infoData, setInfoData] = useState({ title: 'Como se calculan las opiniones?', content: '' });

  useEffect(() => {
    api.get('/products?showAll=1&limit=500').then(r => {
      const data = r.data?.items || r.data?.data || r.data || [];
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/site-sections/reviews_info').then(r => {
      const d = r.data?.data || r.data || {};
      setInfoData({ title: d.title || 'Como se calculan las opiniones?', content: d.content || '' });
    }).catch(() => {});
  }, []);

  return { products, infoData };
}

export function useReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ReviewsAdvancedFilters | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { products, infoData } = useReviewsExtras();
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset } = form;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/admin/all');
      setReviews(Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.value || []));
    } catch { setReviews([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); reset({ productId: '', name: '', rating: 5, comment: '', active: true, verified: true }); setModalOpen(true); };
  const openEdit = (r: Review) => { setEditItem(r); reset({ productId: r.productId, name: r.name, rating: r.rating, comment: r.comment, active: r.active, verified: r.verified }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/reviews/' + editItem.id, data); toast('Resena actualizada', 'success'); }
      else { await api.post('/reviews', data); toast('Resena creada', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (r: Review) => {
    try { await api.patch('/reviews/' + r.id, { active: !r.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/reviews/' + deleteTarget.id); toast('Eliminada', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = reviews.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
    if (!advancedFilters) return matchSearch;
    const matchProduct = advancedFilters.productId ? r.productId === advancedFilters.productId : true;
    const matchActive = advancedFilters.active !== null ? r.active === advancedFilters.active : true;
    const matchRating = advancedFilters.rating !== null ? r.rating === advancedFilters.rating : true;
    return matchSearch && matchProduct && matchActive && matchRating;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || ''; const bVal = (b as any)[sortField] || '';
    if (sortField === 'rating') return sortDir === 'asc' ? a.rating - b.rating : b.rating - a.rating;
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, advancedOpen, setAdvancedOpen, advancedFilters, setAdvancedFilters, sortField,
    currentPage, setCurrentPage, showInfoModal, setShowInfoModal, products, infoData,
    openCreate, openEdit, onSubmit, toggleActive, handleDelete, handleSort, filtered, totalPages, paginated,
  };
}
