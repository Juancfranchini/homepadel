'use client';

// ProductForm â€” formulario completo de creación/edición de producto
// Cubre todos los campos del spec: info básica, precios, stock, imágenes,
// rendimiento (6 barras), caracterí­sticas dinámicas, video y SEO.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  Package, DollarSign, BarChart2, Zap, Video, Image as ImageIcon,
  CreditCard, List,
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

// â”€â”€â”€ Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const perfStatSchema = z.object({
  label: z.string().min(1),
  value: z.coerce.number().min(0).max(100),
});

const featureSchema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
});

const schema = z.object({
  // Básico
  name: z.string().min(2, 'Nombre requerido (mí­n. 2 caracteres)'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU requerido'),
  categoryId: z.string().min(1, 'Seleccioná una categorí­a'),
  brandId: z.string().min(1, 'Seleccioná una marca'),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  active: z.boolean().default(true),

  // Precios
  price: z.coerce.number().min(0, 'Precio requerido'),
  salePrice: z.coerce.number().min(0).optional(),
  transferPrice: z.coerce.number().min(0).optional(),

  // Stock
  stock: z.coerce.number().int().min(0),

  // Imágenes (URLs)
  images: z.array(z.string().url('URL de imagen inválida')).optional(),

  // Rendimiento (performance stats)
  performanceStats: z.array(perfStatSchema).optional(),

  // Caracterí­sticas
  features: z.array(featureSchema).optional(),

  // DESTACADOS â€” bullets por producto
  highlights: z.array(z.string().min(1)).optional(),

  // Medios de pago habilitados
  paymentMethods: z.array(z.string()).optional(),

  // Video
  videoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// â”€â”€â”€ Defaults â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEFAULT_PERF: z.infer<typeof perfStatSchema>[] = [
  { label: 'Control', value: 85 },
  { label: 'Potencia', value: 75 },
  { label: 'Salida de bola', value: 80 },
  { label: 'Manejabilidad', value: 82 },
  { label: 'Dureza', value: 70 },
  { label: 'Jugabilidad', value: 88 },
];

const DEFAULT_FEATURES: z.infer<typeof featureSchema>[] = [
  { icon: 'âš¡', title: 'Material', subtitle: 'Carbono 18K' },
  { icon: 'ðŸŽ¯', title: 'Forma', subtitle: 'Redonda' },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <span className="text-[#C8FF00] bg-[#0f172a] w-8 h-8 rounded-lg flex items-center justify-center">
          {icon}
        </span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

// â”€â”€â”€ Catálogo de medios de pago â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PaymentMethodDef { label: string; group: 'credit' | 'debit' | 'transfer' | 'wallet'; color: string }

const PAYMENT_CATALOG: Record<string, PaymentMethodDef> = {
  visa: { label: 'Visa', group: 'credit', color: 'bg-blue-100 text-blue-800' },
  mastercard: { label: 'Mastercard', group: 'credit', color: 'bg-orange-100 text-orange-800' },
  amex: { label: 'Amex', group: 'credit', color: 'bg-blue-100 text-blue-900' },
  naranja_x: { label: 'Naranja X', group: 'credit', color: 'bg-orange-100 text-orange-700' },
  nativa: { label: 'Nativa', group: 'credit', color: 'bg-yellow-100 text-yellow-800' },
  cabal: { label: 'Cabal', group: 'credit', color: 'bg-red-100 text-red-800' },
  argencard: { label: 'Argencard', group: 'credit', color: 'bg-green-100 text-green-800' },
  visa_deb: { label: 'Visa Dí©bito', group: 'debit', color: 'bg-blue-50 text-blue-700' },
  mc_deb: { label: 'MC Dí©bito', group: 'debit', color: 'bg-orange-50 text-orange-700' },
  cabal_deb: { label: 'Cabal Dí©bito', group: 'debit', color: 'bg-red-50 text-red-700' },
  transferencia: { label: 'Transferencia', group: 'transfer', color: 'bg-green-100 text-green-900' },
  banelco: { label: 'Banelco', group: 'transfer', color: 'bg-green-100 text-green-800' },
  link: { label: 'Link Pagos', group: 'transfer', color: 'bg-emerald-100 text-emerald-800' },
  mercadopago: { label: 'Mercado Pago', group: 'wallet', color: 'bg-sky-100 text-sky-800' },
  cuenta_dni: { label: 'Cuenta DNI', group: 'wallet', color: 'bg-slate-100 text-slate-800' },
};

const PAYMENT_GROUPS: { key: 'credit' | 'debit' | 'transfer' | 'wallet'; label: string }[] = [
  { key: 'credit', label: 'Tarjetas de crí©dito' },
  { key: 'debit', label: 'Tarjetas de dí©bito' },
  { key: 'transfer', label: 'Transferencia / depósito' },
  { key: 'wallet', label: 'Billetera virtual' },
];

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Props {
  mode: 'create' | 'edit';
  productId?: string;
}

interface Category { id: string; name: string }
interface Brand { id: string; name: string }

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function ProductForm({ mode, productId }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: true,
      featured: false,
      isNew: false,
      isOffer: false,
      stock: 0,
      price: 0,
      images: [],
      performanceStats: [],   // vací­o: el admin rellena solo si quiere mostrar barras
      features: [],   // vací­o: el admin rellena solo si quiere mostrar caracterí­sticas
    },
  });

  const perfArray = useFieldArray({ control, name: 'performanceStats' });
  const featuresArray = useFieldArray({ control, name: 'features' });
  const imagesWatch = watch('images') ?? [];
  const highlightsWatch = watch('highlights') ?? [];
  const paymentWatch = watch('paymentMethods') ?? [];

  // â”€â”€ Load catalogs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadCatalogs = useCallback(async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
      ]);
      const c = cRes.data?.data ?? cRes.data;
      const b = bRes.data?.data ?? bRes.data;
      setCategories(Array.isArray(c) ? c : []);
      setBrands(Array.isArray(b) ? b : []);
    } catch {
      setCategories([]);
      setBrands([]);
    }
  }, []);

  // â”€â”€ Load product for edit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadProduct = useCallback(async () => {
    if (mode !== 'edit' || !productId) return;
    setLoading(true);
    try {
      const res = await api.get(`/products/${productId}`);
      const p = res.data;
      reset({
        name: p.name,
        description: p.description ?? '',
        sku: p.sku,
        categoryId: p.category?.id ?? p.categoryId ?? '',
        brandId: p.brand?.id ?? p.brandId ?? '',
        featured: p.featured ?? false,
        isNew: p.isNew ?? false,
        isOffer: p.isOffer ?? false,
        active: p.active ?? true,
        price: p.price ?? 0,
        salePrice: p.salePrice ?? undefined,
        transferPrice: p.transferPrice ?? undefined,
        stock: p.stock ?? 0,
        images: Array.isArray(p.images) ? p.images : [],
        performanceStats: Array.isArray(p.performanceStats) ? p.performanceStats : [],
        features: Array.isArray(p.features) ? p.features : [],
        highlights: Array.isArray(p.highlights) ? p.highlights : [],
        paymentMethods: Array.isArray(p.paymentMethods) ? p.paymentMethods : [],
        videoUrl: p.videoUrl ?? '',
      });
    } catch {
      toast('Error al cargar el producto', 'error');
      router.push('/productos');
    } finally {
      setLoading(false);
    }
  }, [mode, productId, reset, toast, router]);

  useEffect(() => {
    loadCatalogs();
    loadProduct();
  }, [loadCatalogs, loadProduct]);

  // â”€â”€ Image helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setValue('images', [...imagesWatch, url]);
    setNewImageUrl('');
  };

  const removeImage = (idx: number) => {
    setValue('images', imagesWatch.filter((_, i) => i !== idx));
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...data,
        salePrice: data.salePrice && data.salePrice > 0 ? data.salePrice : undefined,
        transferPrice: data.transferPrice && data.transferPrice > 0 ? data.transferPrice : undefined,
        videoUrl: data.videoUrl?.trim() || undefined,
        images: data.images ?? [],
        performanceStats: data.performanceStats ?? [],
        features: data.features ?? [],
        highlights: data.highlights ?? [],
        paymentMethods: data.paymentMethods ?? [],
      };

      if (mode === 'create') {
        await api.post('/products', payload);
        toast('Producto creado correctamente', 'success');
      } else {
        await api.patch(`/products/${productId}`, payload);
        toast('Producto actualizado correctamente', 'success');
      }
      router.push('/productos');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const raw = axiosErr.response?.data?.message ?? 'Error al guardar el producto';
      const msg = Array.isArray(raw) ? raw.join(' Â· ') : String(raw);
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-[#C8FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* â”€â”€ Top bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/productos')}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === 'create' ? 'Completá los datos del nuevo producto' : 'Modificá los datos del producto'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/productos')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* â”€â”€ LEFT COLUMN (2/3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="xl:col-span-2 space-y-6">

          {/* Información básica */}
          <SectionCard icon={<Package className="w-4 h-4" />} title="Información básica">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label required>Nombre</Label>
                <input {...register('name')} className="input-field" placeholder="Ej: Paleta Nox AT10 Genius 18K" />
                <ErrorMsg msg={errors.name?.message} />
              </div>

              <div>
                <Label required>SKU</Label>
                <input {...register('sku')} className="input-field" placeholder="NOX-AT10-18K" />
                <ErrorMsg msg={errors.sku?.message} />
                <p className="text-xs text-gray-400 mt-1">Identificador íºnico del producto</p>
              </div>

              <div>
                <Label>Stock disponible</Label>
                <input type="number" min={0} {...register('stock')} className="input-field" />
              </div>

              <div>
                <Label required>Categorí­a</Label>
                <select {...register('categoryId')} className="input-field pr-10">
                  <option value="">Seleccionar categorí­a</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ErrorMsg msg={errors.categoryId?.message} />
              </div>

              <div>
                <Label required>Marca</Label>
                <select {...register('brandId')} className="input-field pr-10">
                  <option value="">Seleccionar marca</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <ErrorMsg msg={errors.brandId?.message} />
              </div>

              <div className="sm:col-span-2">
                <Label>Descripción</Label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Descripción detallada del producto..."
                />
              </div>
            </div>
          </SectionCard>

          {/* Precios */}
          <SectionCard icon={<DollarSign className="w-4 h-4" />} title="Precios">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Precio normal ($)</Label>
                <input type="number" min={0} step={100} {...register('price')} className="input-field" placeholder="0" />
                <ErrorMsg msg={errors.price?.message} />
              </div>
              <div>
                <Label>Precio oferta ($) <span className="text-gray-400 font-normal">(opcional)</span></Label>
                <input type="number" min={0} step={100} {...register('salePrice')} className="input-field" placeholder="0" />
                <p className="text-xs text-gray-400 mt-1">Se muestra tachado el precio normal cuando es menor</p>
              </div>
              <div>
                <Label>Precio por transferencia ($) <span className="text-gray-400 font-normal">(opcional)</span></Label>
                <input type="number" min={0} step={100} {...register('transferPrice')} className="input-field" placeholder="0" />
                <p className="text-xs text-gray-400 mt-1">Si no se configura, se muestra 80% del precio activo</p>
              </div>
              <div className="flex items-end">
                <div className="bg-gray-50 rounded-lg p-3 w-full text-xs text-gray-600">
                  ðŸ“¦ <strong>9 cuotas sin interí©s</strong> = precio activo í· 9<br />
                  <span className="text-gray-400">(calculado automáticamente)</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Imágenes */}
          <SectionCard icon={<ImageIcon className="w-4 h-4" />} title="Imágenes del producto">
            <div>
              <Label>Agregar imagen por URL</Label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                  className="input-field"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Presioná Enter o el botón + para agregar. La primera imagen es la principal.</p>
            </div>

            {imagesWatch.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                {imagesWatch.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`imagen ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text y="55" x="50" font-size="30" text-anchor="middle">ðŸ–¼ï¸</text></svg>'; }}
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-[#C8FF00] text-[#0f172a] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Principal</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin imágenes todaví­a. Pegá una URL arriba para agregar.</p>
              </div>
            )}
          </SectionCard>

          {/* Rendimiento */}
          <SectionCard icon={<BarChart2 className="w-4 h-4" />} title="Estadí­sticas de rendimiento">
            <p className="text-xs text-gray-500 -mt-2 mb-2">Valores del 0 al 100. Se muestran como barras de progreso en el detalle del producto.</p>
            <div className="space-y-3">
              {perfArray.fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      {...register(`performanceStats.${idx}.label`)}
                      className="input-field text-sm"
                      placeholder="Etiqueta (ej: Control)"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        {...register(`performanceStats.${idx}.value`)}
                        className="flex-1 accent-[#C8FF00]"
                      />
                      <span className="text-sm font-bold text-gray-700 w-8 text-right">
                        {watch(`performanceStats.${idx}.value`) ?? 0}
                      </span>
                    </div>
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-300" />
                  <button
                    type="button"
                    onClick={() => perfArray.remove(idx)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => perfArray.append({ label: '', value: 75 })}
              className="flex items-center gap-1.5 text-sm text-[#0f172a] hover:text-gray-600 font-medium mt-1"
            >
              <Plus className="w-4 h-4" /> Agregar estadí­stica
            </button>
          </SectionCard>

          {/* Caracterí­sticas */}
          <SectionCard icon={<Zap className="w-4 h-4" />} title="Caracterí­sticas destacadas">
            <p className="text-xs text-gray-500 -mt-2 mb-2">Cards de caracterí­sticas tí©cnicas que se muestran debajo de las barras de rendimiento.</p>
            <div className="space-y-3">
              {featuresArray.fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start bg-gray-50 p-3 rounded-lg">
                  <input
                    {...register(`features.${idx}.icon`)}
                    className="w-10 h-9 border border-gray-200 rounded-lg text-center text-base bg-white"
                    placeholder="âš¡"
                  />
                  <input
                    {...register(`features.${idx}.title`)}
                    className="input-field text-sm"
                    placeholder="Tí­tulo (ej: Carbono 18K)"
                  />
                  <input
                    {...register(`features.${idx}.subtitle`)}
                    className="input-field text-sm"
                    placeholder="Subtí­tulo (ej: Alta resistencia)"
                  />
                  <button
                    type="button"
                    onClick={() => featuresArray.remove(idx)}
                    className="p-1.5 text-red-400 hover:text-red-600 transition-colors mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => featuresArray.append({ icon: '', title: '', subtitle: '' })}
              className="flex items-center gap-1.5 text-sm text-[#0f172a] hover:text-gray-600 font-medium mt-1"
            >
              <Plus className="w-4 h-4" /> Agregar caracterí­stica
            </button>
          </SectionCard>

          {/* Video */}
          <SectionCard icon={<Video className="w-4 h-4" />} title="Video del producto">
            <div>
              <Label>URL de YouTube o Vimeo</Label>
              <input
                {...register('videoUrl')}
                className="input-field"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-400 mt-1">Si tiene video se muestra en el detalle del producto. Dejar vací­o para ocultar.</p>
            </div>
            {watch('videoUrl') && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex items-center gap-2">
                <Video className="w-4 h-4 text-gray-400" />
                Video configurado: {watch('videoUrl')}
              </div>
            )}
          </SectionCard>

          {/* DESTACADOS */}
          <SectionCard icon={<List className="w-4 h-4" />} title="Destacados del producto">
            <p className="text-xs text-gray-500 -mt-2 mb-2">
              Bullets que aparecen en la sección &quot;DESTACADOS&quot; del detalle del producto. Cada producto puede tener los suyos.
            </p>
            <div className="space-y-2">
              {highlightsWatch.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={item}
                    onChange={(e) => {
                      const updated = [...highlightsWatch];
                      updated[idx] = e.target.value;
                      setValue('highlights', updated);
                    }}
                    className="input-field flex-1 text-sm"
                    placeholder="Ej: Producto original con garantí­a oficial"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('highlights', highlightsWatch.filter((_, i) => i !== idx))}
                    className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const text = newHighlight.trim();
                    if (!text) return;
                    setValue('highlights', [...highlightsWatch, text]);
                    setNewHighlight('');
                  }
                }}
                className="input-field flex-1 text-sm"
                placeholder="Escribí­ un destacado y presioná Enter o +"
              />
              <button
                type="button"
                onClick={() => {
                  const text = newHighlight.trim();
                  if (!text) return;
                  setValue('highlights', [...highlightsWatch, text]);
                  setNewHighlight('');
                }}
                className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </SectionCard>

          {/* Medios de pago */}
          <SectionCard icon={<CreditCard className="w-4 h-4" />} title="Medios de pago habilitados">
            <p className="text-xs text-gray-500 -mt-2 mb-3">
              Seleccioná los medios de pago disponibles para este producto. Se muestran en el botón &quot;Ver más detalles&quot; de la página del producto.
            </p>
            {PAYMENT_GROUPS.map((group) => {
              const methods = Object.entries(PAYMENT_CATALOG).filter(([, def]) => def.group === group.key);
              return (
                <div key={group.key} className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {methods.map(([key, def]) => {
                      const checked = paymentWatch.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            const updated = checked
                              ? paymentWatch.filter((k) => k !== key)
                              : [...paymentWatch, key];
                            setValue('paymentMethods', updated);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${checked
                              ? `${def.color} border-current ring-2 ring-offset-1 ring-current/30`
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {def.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {paymentWatch.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                Sin medios de pago configurados â€” el botón &quot;Ver más detalles&quot; no se mostrará en el frontend.
              </p>
            )}
          </SectionCard>

        </div>

        {/* â”€â”€ RIGHT COLUMN (1/3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="space-y-6">

          {/* Estado y visibilidad */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Estado y visibilidad</h3>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Activo</p>
                <p className="text-xs text-gray-500">Visible en la tienda</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('active')} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C8FF00]" />
              </label>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Destacado</p>
                <p className="text-xs text-gray-500">Aparece en Home</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('featured')} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C8FF00]" />
              </label>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Etiquetas</p>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isNew"   {...register('isNew')} className="w-4 h-4 rounded accent-[#C8FF00]" />
                <label htmlFor="isNew" className="text-sm text-gray-700 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">NUEVO</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isOffer" {...register('isOffer')} className="w-4 h-4 rounded accent-[#C8FF00]" />
                <label htmlFor="isOffer" className="text-sm text-gray-700 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">OFERTA</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview precios */}
          {watch('price') > 0 && (() => {
            const basePrice = Number(watch('price'));
            const saleVal = Number(watch('salePrice') ?? 0);
            const transferVal = Number(watch('transferPrice') ?? 0);
            const hasOffer = saleVal > 0 && saleVal < basePrice;
            const activePrice = hasOffer ? saleVal : basePrice;
            const transferShow = transferVal > 0 ? transferVal : Math.ceil(activePrice * 0.8);
            return (
              <div className="bg-[#0f172a] rounded-xl p-5 text-white">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">Preview de precios</p>
                {hasOffer ? (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-2xl font-black text-[#C8FF00]">
                        ${saleVal.toLocaleString('es-AR')}
                      </p>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                        -{Math.round((1 - saleVal / basePrice) * 100)}% OFF
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-through">${basePrice.toLocaleString('es-AR')}</p>
                  </>
                ) : (
                  <p className="text-2xl font-black text-white">${basePrice.toLocaleString('es-AR')}</p>
                )}
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>ðŸ’³ Con transferencia{transferVal > 0 ? ' âœ“' : ' (auto)'}</span>
                    <span className="text-[#C8FF00] font-bold">
                      ${transferShow.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>ðŸ“¦ 9 cuotas s/interí©s</span>
                    <span className="text-[#C8FF00] font-bold">
                      ${Math.ceil(activePrice / 9).toLocaleString('es-AR')}/mes
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Guardar rápido */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/productos')}
              className="btn-secondary w-full justify-center"
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}
