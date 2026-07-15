'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit2, Trash2, ArrowRight, ImageIcon, Youtube, BarChart3, ListChecks, ArrowLeftRight, Save, GitCompare } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import VideoTab from './components/VideoTab';
import RendimientoTab from './components/RendimientoTab';
import HighlightsTab from './components/HighlightsTab';
import RelacionadosTab from './components/RelacionadosTab';
import ComparaTab from './components/ComparaTab';
import DetalleModal from './components/DetalleModal';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

const PERF_LABELS = ['Control', 'Potencia', 'Manejabilidad', 'Dureza', 'Jugabilidad'];

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
});
type FormData = z.infer<typeof schema>;

interface Product {
  id: string; name: string; slug: string; images: string[];
  videoUrl?: string; highlightsTitle?: string; highlightsDescription?: string;
  highlights?: string[];
  performanceStats?: { label: string; value: number }[];
  specs?: { icon: string; title: string; value: string }[];
  relatedVideos?: { title: string; url: string }[];
  relatedProductIds?: string[];
  compareData?: any;
}

export default function ProductosContenidoPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'rendimiento' | 'highlights' | 'relacionados' | 'compara'>('video');

  const { register, handleSubmit, reset, setValue, watch, control } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?showAll=1&limit=200');
      setProducts(Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

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
    });
    setModalOpen(true);
  };

  const openDetail = (p: Product) => { setDetailItem(p); setDetailOpen(true); };

  const onSubmit = async (data: FormData) => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.patch('/products/' + selected.id, {
        videoUrl: data.videoUrl || '', highlightsTitle: data.highlightsTitle || '', highlightsDescription: data.highlightsDescription || '',
        highlights: (data.highlights || []).map((h) => h.text).filter(Boolean),
        performanceStats: data.performanceStats || [], specs: data.specs || [],
        relatedVideos: data.relatedVideos || [], relatedProductIds: data.relatedProductIds || [],
        compareData: data.compareData || { fields: [], products: [] },
      });
      toast('Contenido actualizado', 'success'); setModalOpen(false); load();
    } catch { toast('Error', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/products/' + deleteTarget.id); toast('Producto eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  const TABS = [
    { key: 'video' as const, label: 'Video', icon: Youtube },
    { key: 'rendimiento' as const, label: 'Rendimiento', icon: BarChart3 },
    { key: 'highlights' as const, label: 'Por que elegirlo', icon: ListChecks },
    { key: 'compara' as const, label: 'Compara modelos', icon: GitCompare },
    { key: 'relacionados' as const, label: 'Relacionados', icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contenido de Productos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{products.length} productos</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Video</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rendimiento</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Highlights</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
          </tr></thead>
          <tbody>
            {products.map((p) => {
              const imgSrc = getImageUrl(p.images?.[0]);
              return (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{imgSrc ? <img src={imgSrc} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>}</td>
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{p.name}</p></td>
                  <td className="px-4 py-3 text-center">{p.videoUrl ? <Youtube className="w-4 h-4 text-green-500 mx-auto" /> : '-'}</td>
                  <td className="px-4 py-3 text-center">{p.performanceStats?.length ? <BarChart3 className="w-4 h-4 text-blue-500 mx-auto" /> : '-'}</td>
                  <td className="px-4 py-3 text-center">{p.highlights?.length ? <ListChecks className="w-4 h-4 text-amber-500 mx-auto" /> : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEditor(p)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => openDetail(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Detalle"><ArrowRight className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && selected && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={'Contenido: ' + selected.name} size="xl">
          <div className="flex gap-0">
            <div className="w-44 flex-shrink-0 border-r border-gray-100 pr-3 space-y-1">
              {TABS.map((tab) => { const Icon = tab.icon; return (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  className={'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors ' + (activeTab === tab.key ? 'bg-[#C8FF00]/10 border border-[#C8FF00]/30 text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-50')}>
                  <Icon size={14} />{tab.label}
                </button>
              );})}
            </div>
            <div className="flex-1 pl-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {activeTab === 'video' && <VideoTab register={register} control={control} />}
                {activeTab === 'rendimiento' && <RendimientoTab register={register} control={control} watch={watch} />}
                {activeTab === 'highlights' && <HighlightsTab register={register} control={control} />}
                {activeTab === 'relacionados' && <RelacionadosTab products={products} selectedId={selected.id} register={register} setValue={setValue} control={control} />}
                {activeTab === 'compara' && (
                  <ComparaTab
                    value={watch('compareData') || { fields: [], products: [] }}
                    onChange={(data) => setValue('compareData', data, { shouldDirty: true })}
                  />
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 flex items-center gap-2"><Save size={14} />{saving ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      <DetalleModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} item={detailItem} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar producto" description={'Eliminar ' + (deleteTarget?.name || '') + '?'} isLoading={deleting} />
    </div>
  );
}
