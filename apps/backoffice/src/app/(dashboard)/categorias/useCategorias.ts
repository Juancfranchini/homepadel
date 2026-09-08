import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  order?: number;
  active: boolean;
  _count?: { products: number };
}

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  image: z.string().optional(),
});
export type FormData = z.infer<typeof schema>;

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    const data = response?.data;
    if (data?.message) {
      if (Array.isArray(data.message)) return data.message.join('. ');
      return String(data.message);
    }
    if (typeof data === 'string') return data;
  }
  return 'Error inesperado';
}

function useCategoriesSection() {
  const { toast } = useToast();
  const [showCategoriesSection, setShowCategoriesSection] = useState<boolean>(true);
  const [loadingSection, setLoadingSection] = useState(true);

  const loadCategoriesSection = useCallback(async () => {
    setLoadingSection(true);
    try {
      const res = await api.get('/site-sections/categories');
      const section = res.data?.data ? res.data : res.data;
      setShowCategoriesSection(section?.active !== false);
    } catch {
      setShowCategoriesSection(true);
    } finally {
      setLoadingSection(false);
    }
  }, []);

  const handleToggleCategoriesSection = async (checked: boolean) => {
    setShowCategoriesSection(checked);
    try {
      await api.put('/site-sections/categories', {
        active: checked,
        data: { title: 'Categorias', description: 'Encontra lo que necesitas para tu mejor version en la cancha.' },
      });
      toast(checked ? 'Seccion de categorias activada en Landing Page' : 'Seccion de categorias oculta en Landing Page', 'success');
    } catch (err) {
      setShowCategoriesSection(!checked);
      toast(getErrorMessage(err), 'error');
    }
  };

  return { showCategoriesSection, loadingSection, loadCategoriesSection, handleToggleCategoriesSection };
}

async function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => resolve((e.target as HTMLInputElement).files?.[0] || null);
    input.click();
  });
}

function useCategoriesData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/admin/all');
      const data = res.data?.value || res.data?.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { categories, loading, load };
}

function useCategoryCrud(form: ReturnType<typeof useForm<FormData>>, load: () => Promise<void>) {
  const { toast } = useToast();
  const { reset, setValue } = form;
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openCreate = () => { setEditItem(null); reset({ name: '', order: 0, isActive: true, image: '' }); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditItem(c); reset({ name: c.name, order: c.order ?? 0, isActive: c.active, image: c.image || '' }); setModalOpen(true); };

  const handleUpload = async () => {
    const file = await pickImageFile();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setValue('image', res.data?.url || res.data?.imageUrl || '', { shouldDirty: true });
    } catch {
      toast('No se pudo subir la imagen', 'error');
    } finally { setUploading(false); }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { name: data.name, order: data.order, active: data.isActive, ...(data.image ? { image: data.image } : {}) };
      if (editItem) {
        await api.patch('/categories/' + editItem.id, payload);
        toast('categoria actualizada', 'success');
      } else {
        await api.post('/categories', payload);
        toast('categoria creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Category) => {
    try {
      await api.patch('/categories/' + c.id, { active: !c.active });
      toast('Actualizado', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete('/categories/' + deleteTarget.id);
      toast('categoria eliminada', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return {
    modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving, uploading,
    openCreate, openEdit, handleUpload, onSubmit, toggleActive, handleDelete,
  };
}

export function useCategorias() {
  const { categories, loading, load } = useCategoriesData();
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { showCategoriesSection, loadingSection, loadCategoriesSection, handleToggleCategoriesSection } = useCategoriesSection();
  const crud = useCategoryCrud(form, load);

  useEffect(() => { load(); loadCategoriesSection(); }, [load, loadCategoriesSection]);

  const totalPages = Math.ceil(categories.length / pageSize);
  const paginated = categories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    form, categories, loading, currentPage, setCurrentPage, totalPages, paginated, showCategoriesSection, loadingSection,
    handleToggleCategoriesSection, ...crud,
  };
}
