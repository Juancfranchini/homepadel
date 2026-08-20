'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, ImageIcon, Star } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import Toggle from '../../testimonios/components/Toggle';
import ImageGalleryInput from './ImageGalleryInput';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  sku: z.string().min(2, 'SKU requerido'),
  price: z.coerce.number().min(1, 'Precio requerido'),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  categoryId: z.string().min(1, 'Categoria requerida'),
  brandId: z.string().min(1, 'Marca requerida'),
  images: z.array(z.string()).optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  installments: z.coerce.number().int().min(0).max(12).optional(),
  installmentsInterest: z.coerce.number().min(0).optional(),
  hasInstallmentsInterest: z.boolean().default(false),
  isMadeToOrder: z.boolean().default(false),
  estimatedDays: z.coerce.number().int().optional(),
  requiredDeposit: z.coerce.number().min(0).max(100).optional(),
});
export type ProductFormData = z.infer<typeof schema> & { images?: string[] };

interface Category { id: string; name: string }
interface Brand { id: string; name: string }

interface Props {
  defaultValues?: Partial<ProductFormData>;
  onSave: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  categories: Category[];
  brands: Brand[];
}

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function ProductForm({ defaultValues, onSave, onCancel, saving, categories, brands }: Props) {
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(Array.isArray(defaultValues?.images) ? (defaultValues.images as string[]).slice(1) : []);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { active: true, featured: false, isNew: false, isOffer: false, stock: 0, price: 0 },
  });

  const imagesArray = watch('images') || [];
  const imageUrl = imagesArray[0] || '';
  const previewUrl = getImageUrl(imageUrl);
  const featured = watch('featured');
  const active = watch('active');
  const isNew = watch('isNew');
  const isOffer = watch('isOffer');
  const hasInstallmentsInterest = watch('hasInstallmentsInterest');
  const isMadeToOrder = watch('isMadeToOrder');

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.url || res.data?.imageUrl || '';
        const currentImages = watch('images') || []; currentImages[0] = url; setValue('images', [...currentImages].filter(Boolean), { shouldDirty: true });
      } catch {} finally { setUploading(false); }
    };
    input.click();
  };

  return (
    <form onSubmit={handleSubmit((data) => { const mainImage = typeof data.images === 'string' ? data.images : (Array.isArray(data.images) ? data.images[0] : '');
const allImages = [mainImage, ...galleryImages].filter(Boolean) as string[]; onSave({ ...data, images: allImages }); })} className="flex gap-0">
      {/* Columna izquierda - Imagen principal + galeria */}
      <div className="flex-shrink-0 w-[220px] flex flex-col gap-3">
        <div className="w-full h-[220px] rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-300" />
          )}
        </div>
        <div className="flex gap-2">
          <input
            {...register('images')}
            className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
            placeholder="URL de imagen"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 leading-tight">
          Medida recomendada: 800x800px (cuadrada). Fondo blanco. Peso maximo: 500KB.
        </p>
        <div className="mt-2">
          <label className={labelClass}>Imagenes secundarias</label>
          <div className="mt-1">
            <ImageGalleryInput images={galleryImages} onChange={setGalleryImages} />
          </div>
        </div>
      </div>

      {/* Linea vertical */}
      <div className="ml-7 mr-5 w-px bg-gray-200 self-stretch my-2" />

      {/* Columna derecha - Formulario en 2 columnas */}
      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-5 content-start">
        {/* Fila 1 */}
        <div>
          <label className={labelClass}>Nombre *</label>
          <input {...register('name')} className={inputClass + ' mt-1'} />
          {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>SKU *</label>
          <input {...register('sku')} className={inputClass + ' mt-1'} />
          {errors.sku && <p className="text-xs text-red-600 mt-0.5">{errors.sku.message}</p>}
        </div>

        {/* Fila 2 */}
        <div>
          <label className={labelClass}>Precio *</label>
          <input type="number" step="0.01" {...register('price')} className={inputClass + ' mt-1'} />
          {errors.price && <p className="text-xs text-red-600 mt-0.5">{errors.price.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Precio Oferta</label>
          <input type="number" step="0.01" {...register('salePrice')} className={inputClass + ' mt-1'} />
        </div>

        {/* Descuento y Cuotas - solo para productos regulares */}
        {!isMadeToOrder && (
          <>
            <div>
              <label className={labelClass}>% Descuento</label>
              <input type="number" step="0.1" min="0" max="100" {...register('discountPercentage')} className={inputClass + ' mt-1'} placeholder="Ej: 15" />
            </div>
            <div>
              <label className={labelClass}>Cuotas (Mercado Pago)</label>
              <select {...register('installments')} className={inputClass + ' mt-1'}>
                <option value="">Sin cuotas</option>
                <option value="3">3 cuotas</option>
                <option value="6">6 cuotas</option>
                <option value="9">9 cuotas</option>
                <option value="12">12 cuotas</option>
              </select>
            </div>

            <div className="col-span-2">
              <div className="flex items-center gap-4">
                <div>
                  <label className={labelClass}>Interes en cuotas</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Toggle checked={hasInstallmentsInterest} onChange={() => setValue('hasInstallmentsInterest', !hasInstallmentsInterest, { shouldDirty: true })} />
                    <span className={'text-xs font-medium ' + (hasInstallmentsInterest ? 'text-red-600' : 'text-gray-400')}>{hasInstallmentsInterest ? 'Con interes' : 'Sin interes'}</span>
                  </div>
                </div>
                {hasInstallmentsInterest && (
                  <div>
                    <label className={labelClass}>% Interes</label>
                    <input type="number" step="0.1" min="0" {...register('installmentsInterest')} className={inputClass + ' mt-1'} placeholder="Ej: 5" />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Fila 5 - Stock o Por encargo */}
        {!isMadeToOrder ? (
          <div>
            <label className={labelClass}>Stock</label>
            <input type="number" {...register('stock')} className={inputClass + ' mt-1'} />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Dias estimados de fabricacion</label>
            <input type="number" {...register('estimatedDays')} className={inputClass + ' mt-1'} placeholder="Ej: 20" />
          </div>
        )}
        <div>
          <label className={labelClass}>Categoria *</label>
          <select {...register('categoryId')} className={inputClass + ' mt-1'}>
            <option value="">Seleccionar</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <p className="text-xs text-red-600 mt-0.5">{errors.categoryId.message}</p>}
        </div>

        {/* Fila 6 - Producto por encargo */}
        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Producto por encargo</label>
            <div className="flex items-center gap-2">
              <Toggle checked={isMadeToOrder} onChange={() => setValue('isMadeToOrder', !isMadeToOrder, { shouldDirty: true })} />
              <span className={'text-xs font-medium ' + (isMadeToOrder ? 'text-amber-600' : 'text-gray-400')}>{isMadeToOrder ? 'Si' : 'No'}</span>
            </div>
          </div>
          {isMadeToOrder && (
            <div className="mt-2">
              <label className={labelClass}>% de pago adelantado (0 = pago total)</label>
              <input type="number" step="0.1" min="0" max="100" {...register('requiredDeposit')} className={inputClass + ' mt-1'} placeholder="Ej: 30" />
            </div>
          )}
        </div>

        {/* Fila 7 - Marca */}
        <div className="col-span-2">
          <label className={labelClass}>Marca *</label>
          <select {...register('brandId')} className={inputClass + ' mt-1'}>
            <option value="">Seleccionar</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {errors.brandId && <p className="text-xs text-red-600 mt-0.5">{errors.brandId.message}</p>}
        </div>

        {/* Fila 8 - Toggles */}
        <div className="col-span-2 flex items-center gap-8 pt-1">
          <div>
            <label className={labelClass}>Activo</label>
            <div className="flex items-center gap-2 mt-1">
              <Toggle checked={active} onChange={() => setValue('active', !active, { shouldDirty: true })} />
              <span className={'text-xs font-medium ' + (active ? 'text-green-600' : 'text-gray-400')}>{active ? 'Si' : 'No'}</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Nuevo</label>
            <div className="flex items-center gap-2 mt-1">
              <Toggle checked={isNew} onChange={() => setValue('isNew', !isNew, { shouldDirty: true })} />
              <span className={'text-xs font-medium ' + (isNew ? 'text-blue-600' : 'text-gray-400')}>{isNew ? 'Si' : 'No'}</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Oferta</label>
            <div className="flex items-center gap-2 mt-1">
              <Toggle checked={isOffer} onChange={() => setValue('isOffer', !isOffer, { shouldDirty: true })} />
              <span className={'text-xs font-medium ' + (isOffer ? 'text-amber-600' : 'text-gray-400')}>{isOffer ? 'Si' : 'No'}</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Destacado</label>
            <div className="flex items-center gap-2 mt-1">
              <Toggle checked={featured} onChange={() => setValue('featured', !featured, { shouldDirty: true })} />
              <Star className={'w-5 h-5 ' + (featured ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-300')} />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
}