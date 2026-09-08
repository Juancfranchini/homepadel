import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, CreditCard, RefreshCw, Lock, Package, Star, Zap } from 'lucide-react';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
}

export const ICON_OPTIONS = [
  { value: 'Truck', label: 'Envio', icon: Truck },
  { value: 'CreditCard', label: 'Pago', icon: CreditCard },
  { value: 'RefreshCw', label: 'Cambios', icon: RefreshCw },
  { value: 'Lock', label: 'Seguridad', icon: Lock },
  { value: 'Package', label: 'Empaque', icon: Package },
  { value: 'Star', label: 'Garantia', icon: Star },
  { value: 'Zap', label: 'Rapido', icon: Zap },
];

export const ICON_MAP: Record<string, any> = {};
ICON_OPTIONS.forEach((o) => { ICON_MAP[o.value] = o.icon; });

const schema = z.object({
  icon: z.string().min(1, 'Selecciona un icono'),
  title: z.string().min(2, 'El titulo es requerido'),
  description: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
export type FormData = z.infer<typeof schema>;

export function useBeneficios() {
  const { toast } = useToast();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Benefit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Benefit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const { reset } = form;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/benefits/admin/all');
      const data = res.data?.value || res.data?.data || res.data;
      setBenefits(Array.isArray(data) ? [...data].sort((a: Benefit, b: Benefit) => a.order - b.order) : []);
    } catch { setBenefits([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = benefits.filter((b) => {
    const q = search.toLowerCase();
    return b.title.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => {
    setEditItem(null);
    reset({ active: true, order: benefits.length + 1, icon: 'Truck', title: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (b: Benefit) => {
    setEditItem(b);
    reset({ icon: b.icon, title: b.title, description: b.description ?? '', order: b.order, active: b.active });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/benefits/' + editItem.id, data); toast('Beneficio actualizado', 'success'); }
      else { await api.post('/benefits', data); toast('Beneficio creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (b: Benefit) => {
    try { await api.patch('/benefits/' + b.id, { active: !b.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/benefits/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  return {
    form, loading, search, setSearch, page, setPage, modalOpen, setModalOpen, editItem, deleteTarget,
    setDeleteTarget, deleting, saving, filtered, totalPages, currentPage, paginated,
    openCreate, openEdit, onSubmit, toggleActive, handleDelete,
  };
}
