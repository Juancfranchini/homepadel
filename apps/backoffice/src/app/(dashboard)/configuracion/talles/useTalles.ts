import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export interface SizeGuide {
  id: string;
  name: string;
  categoryId: string;
  content: string;
  productIds: string[];
  active: boolean;
  category?: { id: string; name: string };
}

export interface Category { id: string; name: string; products?: { id: string; name: string }[] }

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  categoryId: z.string().min(1, 'La categoria es requerida'),
  content: z.string().optional().default(''),
  productIds: z.array(z.string()).optional().default([]),
  active: z.boolean().default(true),
});
export type FormData = z.infer<typeof schema>;

function useTallesData() {
  const { toast } = useToast();
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, cRes, pRes] = await Promise.all([
        api.get('/size-guides/admin/all'),
        api.get('/categories'),
        api.get('/products?showAll=1&limit=200'),
      ]);
      setGuides(Array.isArray(gRes.data?.data) ? gRes.data.data : Array.isArray(gRes.data) ? gRes.data : []);
      setCategories(Array.isArray(cRes.data?.data) ? cRes.data.data : Array.isArray(cRes.data) ? cRes.data : []);
      const prods = Array.isArray(pRes.data?.items) ? pRes.data.items : Array.isArray(pRes.data?.data) ? pRes.data.data : Array.isArray(pRes.data) ? pRes.data : [];
      setProducts(prods.map((p: any) => ({ id: p.id, name: p.name, categoryId: p.categoryId || p.category?.id || '' })));
    } catch { toast('No se pudo cargar la guía de talles', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return { guides, categories, products, loading, load };
}

export function useTalles() {
  const { toast } = useToast();
  const { guides, categories, products, loading, load } = useTallesData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SizeGuide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SizeGuide | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset, setValue, watch } = form;

  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', categoryId: '', content: '', productIds: [], active: true });
    setSelectedProducts([]);
    setModalOpen(true);
  };

  const openEdit = (item: SizeGuide) => {
    setEditItem(item);
    reset({ name: item.name, categoryId: item.categoryId, content: item.content, productIds: item.productIds || [], active: item.active });
    setSelectedProducts(item.productIds || []);
    setModalOpen(true);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const updated = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      setValue('productIds', updated, { shouldDirty: true });
      return updated;
    });
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { ...data, productIds: selectedProducts };
      if (editItem) {
        await api.patch('/size-guides/' + editItem.id, payload);
        toast('Guía actualizada', 'success');
      } else {
        await api.post('/size-guides', payload);
        toast('Guía creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete('/size-guides/' + deleteTarget.id);
      toast('Guía eliminada', 'success');
      setDeleteTarget(null);
      load();
    } catch { toast('Error al eliminar', 'error'); }
  };

  const toggleActive = async (item: SizeGuide) => {
    try {
      await api.patch('/size-guides/' + item.id, { active: !item.active });
      toast(item.active ? 'Guía desactivada' : 'Guía activada', 'success');
      load();
    } catch { toast('Error', 'error'); }
  };

  const selectedCategoryId = watch('categoryId');
  const pageSize = isMobile ? 3 : 10;
  const totalPages = Math.max(1, Math.ceil(guides.length / pageSize));
  const paginatedGuides = guides.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return {
    form, guides, categories, products, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget,
    saving, selectedProducts, productSearch, setProductSearch, currentPage, setCurrentPage,
    openCreate, openEdit, toggleProduct, onSubmit, handleDelete, toggleActive,
    pageSize, totalPages, paginatedGuides, filteredProducts,
  };
}

export function getCategoryName(categories: Category[], categoryId: string) {
  return categories.find(c => c.id === categoryId)?.name || 'Sin categoria';
}
export function getProductNames(products: { id: string; name: string }[], productIds: string[]) {
  return productIds.map(pid => products.find(p => p.id === pid)?.name || pid).join(', ');
}
