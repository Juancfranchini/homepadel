import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export const PERF_LABELS = ['Control', 'Potencia', 'Manejabilidad', 'Dureza', 'Jugabilidad'];

const schema = z.object({
  videoUrl: z.string().optional().or(z.literal('')),
  highlightsTitle: z.string().optional().or(z.literal('')),
  highlightsDescription: z.string().optional().or(z.literal('')),
  highlights: z.array(z.object({ text: z.string() })).optional(),
  performanceStats: z.array(z.object({ label: z.string(), value: z.coerce.number().min(0).max(100) })).optional(),
  specs: z.array(z.object({ icon: z.string(), title: z.string(), value: z.string() })).optional(),
  relatedVideos: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
  relatedProductIds: z.array(z.string()).optional(),
  compareData: z.any().optional(),
  showVideo: z.boolean().default(false),
  showPerformance: z.boolean().default(false),
  showHighlights: z.boolean().default(false),
  showCompare: z.boolean().default(false),
  showRelated: z.boolean().default(false),
});
export type FormData = z.infer<typeof schema>;

export interface Product {
  id: string; name: string; slug: string; images: string[];
  videoUrl?: string; highlightsTitle?: string; highlightsDescription?: string;
  highlights?: string[];
  performanceStats?: { label: string; value: number }[];
  specs?: { icon: string; title: string; value: string }[];
  relatedVideos?: { title: string; url: string }[];
  relatedProductIds?: string[];
  compareData?: any;
  showVideo?: boolean;
  showPerformance?: boolean;
  showHighlights?: boolean;
  showCompare?: boolean;
  showRelated?: boolean;
}

export type TabKey = 'video' | 'rendimiento' | 'highlights' | 'relacionados' | 'compara';

function useProductsData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?showAll=1&limit=200');
      setProducts(Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { products, loading, load };
}

export function useProductosContenido() {
  const { toast } = useToast();
  const { products, loading, load } = useProductsData();
  const [selected, setSelected] = useState<Product | null>(null);
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('video');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset } = form;

  const totalPages = Math.ceil(products.length / pageSize);
  const paginated = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openEditor = (p: Product) => {
    setSelected(p);
    reset({
      videoUrl: p.videoUrl || '', highlightsTitle: p.highlightsTitle || '', highlightsDescription: p.highlightsDescription || '',
      highlights: (p.highlights || []).map((h) => ({ text: h })),
      performanceStats: p.performanceStats || PERF_LABELS.map((l) => ({ label: l, value: 0 })),
      specs: p.specs || [],
      relatedVideos: p.relatedVideos || [],
      relatedProductIds: p.relatedProductIds || [],
      compareData: p.compareData || { fields: [], products: [] },
      showVideo: p.showVideo !== false, showPerformance: p.showPerformance !== false, showHighlights: p.showHighlights !== false, showCompare: p.showCompare !== false, showRelated: p.showRelated !== false,
    });
    setActiveTab('video');
    setModalOpen(true);
  };

  const openDetail = (p: Product) => { setDetailItem(p); setDetailOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/products/' + deleteTarget.id); toast('Producto eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  const onSubmit = async (data: FormData) => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.patch('/products/' + selected.id, data);
      toast('Contenido guardado', 'success');
      setModalOpen(false);
      load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  return {
    form, products, loading, selected, detailItem, setDetailItem, deleteTarget, setDeleteTarget, modalOpen, setModalOpen,
    detailOpen, setDetailOpen, saving, deleting, activeTab, setActiveTab, currentPage, setCurrentPage,
    totalPages, paginated, openEditor, openDetail, handleDelete, onSubmit,
  };
}
