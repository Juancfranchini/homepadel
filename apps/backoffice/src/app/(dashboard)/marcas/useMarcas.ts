import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

export function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  logoUrl?: string | null;
  url?: string;
  order?: number;
  active?: boolean;
  isActive?: boolean;
  _count?: { products: number };
}

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  url: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  logo: z.string().optional(),
});
export type FormData = z.infer<typeof schema>;

export function isBrandActive(b: Brand) { return b.active ?? b.isActive ?? false; }

function pickLogoFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => resolve((e.target as HTMLInputElement).files?.[0] || null);
    input.click();
  });
}

function useBrandsData() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands/admin/all');
      const data = res.data?.value || res.data?.data || res.data;
      setBrands(Array.isArray(data) ? data : []);
    } catch { setBrands([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { brands, loading, load };
}

export function useMarcas() {
  const { toast } = useToast();
  const { brands, loading, load } = useBrandsData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset, setValue } = form;

  const totalPages = Math.ceil(brands.length / pageSize);
  const paginated = brands.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', url: '', order: 0, isActive: true, logo: '' });
    setModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditItem(b);
    reset({ name: b.name, url: b.url ?? '', order: b.order ?? 0, isActive: b.active ?? b.isActive ?? true, logo: b.logo || b.logoUrl || '' });
    setModalOpen(true);
  };

  const handleUpload = async () => {
    const file = await pickLogoFile();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setValue('logo', res.data?.url || res.data?.imageUrl || '', { shouldDirty: true });
    } catch {
      toast('No se pudo subir el logo', 'error');
    } finally { setUploading(false); }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { name: data.name, url: data.url, order: data.order, active: data.isActive, ...(data.logo ? { logo: data.logo } : {}) };
      if (editItem) {
        await api.patch('/brands/' + editItem.id, payload);
        toast('Marca actualizada', 'success');
      } else {
        await api.post('/brands', payload);
        toast('Marca creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (b: Brand) => {
    try {
      await api.patch('/brands/' + b.id, { active: !isBrandActive(b) });
      toast('Actualizado', 'success');
      load();
    } catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete('/brands/' + deleteTarget.id);
      toast('Marca eliminada', 'success');
      setDeleteTarget(null);
      load();
    } catch { toast('Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  return {
    form, brands, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    uploading, currentPage, setCurrentPage, totalPages, paginated, openCreate, openEdit, handleUpload,
    onSubmit, toggleActive, handleDelete,
  };
}
