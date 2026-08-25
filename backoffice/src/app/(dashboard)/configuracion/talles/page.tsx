'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ArrowLeft, Save, Ruler, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import Toggle from '../../testimonios/components/Toggle';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface SizeGuide {
  id: string;
  name: string;
  categoryId: string;
  content: string;
  productIds: string[];
  active: boolean;
  category?: { id: string; name: string };
}

interface Category { id: string; name: string; products?: { id: string; name: string }[] }

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  categoryId: z.string().min(1, 'La categoria es requerida'),
  content: z.string().optional().default(''),
  productIds: z.array(z.string()).optional().default([]),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function TallesPage() {
  const { toast } = useToast();
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SizeGuide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SizeGuide | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

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
        toast('Guia actualizada', 'success');
      } else {
        await api.post('/size-guides', payload);
        toast('Guia creada', 'success');
      }
      setModalOpen(false);
      load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete('/size-guides/' + deleteTarget.id);
      toast('Guia eliminada', 'success');
      setDeleteTarget(null);
      load();
    } catch { toast('Error al eliminar', 'error'); }
  };

  const toggleActive = async (item: SizeGuide) => {
    try {
      await api.patch('/size-guides/' + item.id, { active: !item.active });
      toast(item.active ? 'Guia desactivada' : 'Guia activada', 'success');
      load();
    } catch { toast('Error', 'error'); }
  };

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'Sin categoria';
  const getProductNames = (productIds: string[]) => productIds.map(pid => products.find(p => p.id === pid)?.name || pid).join(', ');

  const selectedCategoryId = watch('categoryId');
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Ruler className="w-5 h-5 text-[#C8FF00]" />Guia de Talles</h1>
            <p className="text-gray-500 text-sm mt-0.5">{guides.length} guias configuradas</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nueva Guia
        </button>
      </div>

      {guides.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay guias de talles configuradas</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Productos</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciónes</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{item.name}</p></td>
                  <td className="px-4 py-3"><span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getCategoryName(item.categoryId)}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">{getProductNames(item.productIds || []) || 'Todos'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Toggle checked={item.active} onChange={() => toggleActive(item)} />
                      <span className={'text-xs font-medium ' + (item.active ? 'text-green-600' : 'text-gray-400')}>{item.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Guia' : 'Nueva Guia'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input {...register('name')} className={inputClass} placeholder="Ej: Guia de Talles Calzado" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Categoría *</label>
              <select {...register('categoryId')} className={inputClass}>
                <option value="">Seleccionar categoria</option>
                {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>}
            </div>
          </div>

          {/* Productos asociados */}
          <div>
            <label className={labelClass}>Productos asociados (opciónal)</label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full px-3 py-1.5 border-b border-gray-100 text-xs mb-2 focus:outline-none"
              />
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-gray-400">No se encontraron productos</p>
              ) : (
                filteredProducts.slice(0, 50).map(p => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded text-sm">
                    <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} className="w-3.5 h-3.5 rounded accent-[#C8FF00]" />
                    <span className="text-gray-700 text-xs">{p.name}</span>
                  </label>
                ))
              )}
            </div>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedProducts.map(pid => {
                  const p = products.find(pr => pr.id === pid);
                  return (
                    <span key={pid} className="inline-flex items-center gap-1 bg-[#C8FF00]/10 text-[#0f172a] text-xs px-2 py-0.5 rounded-full">
                      {p?.name || pid}
                      <button type="button" onClick={() => toggleProduct(pid)}><X size={12} /></button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Editor enriquecido */}
          <div>
            <label className={labelClass}>Contenido</label>
            <RichTextEditor
              content={watch('content') || ''}
              onChange={(html) => setValue('content', html, { shouldDirty: true })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="sgActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="sgActive" className="text-sm text-gray-700">Visible en el sitio</label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
              <Save className="w-4 h-4 inline mr-1" />{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Guia"
        description={'Eliminar la guia ' + (deleteTarget?.name || '') + '?'}
      />
    </div>
  );
}