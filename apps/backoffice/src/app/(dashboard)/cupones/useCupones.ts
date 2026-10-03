import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  minAmount?: number;
  maxUses?: number;
  maxDiscount?: number | null;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

/**
 * Número opcional: un input vacío ("") es "sin valor". z.coerce.number() lo
 * convertía en 0, y "Usos máximos" vacío (ilimitado) fallaba el mínimo de 1:
 * no se podía crear un cupón sin límite de usos.
 */
const numeroOpcional = (min: number, entero = false) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    (entero ? z.coerce.number().int('Tiene que ser un número entero') : z.coerce.number()).min(min, 'Mínimo ' + min).optional(),
  );

const schema = z.object({
  code: z.string().trim().min(3, 'El código es requerido').regex(/^[A-Za-z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos').toUpperCase(),
  discount: z.coerce.number().min(1, 'Minimo 1'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  minAmount: numeroOpcional(0),
  maxUses: numeroOpcional(1, true),
  maxDiscount: numeroOpcional(1),
  active: z.boolean().default(true),
  expiresAt: z.string().optional().or(z.literal('')),
}).refine((d) => d.type !== 'PERCENTAGE' || d.discount <= 100, { message: 'Un porcentaje no puede superar el 100%', path: ['discount'] });
export type FormData = z.infer<typeof schema>;

export function useCupones() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { type: 'PERCENTAGE', active: true } });
  const { reset } = form;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      const data = res.data?.value || res.data?.data || res.data;
      setCoupons(Array.isArray(data) ? data : []);
    } catch { setCoupons([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const openCreate = () => { setEditItem(null); reset({ code: '', discount: 10, type: 'PERCENTAGE', minAmount: 0, maxUses: undefined, maxDiscount: undefined, active: true, expiresAt: '' }); setModalOpen(true); };
  const openEdit = (c: Coupon) => { setEditItem(c); reset({ code: c.code, discount: c.discount, type: c.type as any, minAmount: c.minAmount, maxUses: c.maxUses, maxDiscount: c.maxDiscount ?? undefined, active: c.active, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      // null y no undefined: al editar, vaciar un campo tiene que borrarlo, no dejar el valor anterior.
      const payload = {
        ...data,
        minAmount: data.minAmount ?? null,
        maxUses: data.maxUses ?? null,
        maxDiscount: data.maxDiscount ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      };
      if (editItem) { await api.patch('/coupons/' + editItem.id, payload); toast('Cupón actualizado', 'success'); }
      else { await api.post('/coupons', payload); toast('Cupón creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (c: Coupon) => {
    try { await api.patch('/coupons/' + c.id, { active: !c.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/coupons/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, currentPage, setCurrentPage, openCreate, openEdit, onSubmit, toggleActive, handleDelete,
    filtered, totalPages, paginated,
  };
}
