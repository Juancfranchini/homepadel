'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, ImageIcon, Star, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
  salePrice: z.string().optional().transform((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  transferPrice: z.string().optional().transform((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  stock: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  categoryId: z.string().min(1, 'Categoria requerida'),
  brandId: z.string().min(1, 'Marca requerida'),
  images: z.array(z.string()).optional(),
  discountPercentage: z.string().optional().transform((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  installments: z.string().optional().transform((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  installmentsInterest: z.string().optional().transform((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  hasInstallmentsInterest: z.boolean().default(false),
  isMadeToOrder: z.boolean().default(false),
  estimatedDays: z.string().optional().transform((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  requiredDeposit: z.string().optional().transform((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
});

export type ProductFormData = z.infer<typeof schema> & { images?: string[]; salePrice?: number; variants?: { sku: string; size: string; color?: string; stock: number }[] };

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

export default function ProductForm({
  defaultValues, onSave, onCancel, saving, categories, brands, ...rest }: Props) {
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<{ sku: string; size: string; color?: string; imageUrl?: string; images?: string[]; stock: number }[]>(() => {
    return defaultValues?.variants || [];
  });
  const [hasSalePrice, setHasSalePrice] = useState<boolean>(() => {
    return defaultValues?.salePrice !== undefined && defaultValues.salePrice !== null && defaultValues.salePrice > 0;
  });
  const salePriceTempRef = useRef<number | undefined>(defaultValues?.salePrice);
  const [galleryImages, setGalleryImages] = useState<string[]>(Array.isArray(defaultValues?.images) ? (defaultValues.images as string[]).slice(1) : []);
  const [mainImage, setMainImage] = useState<string>(Array.isArray(defaultValues?.images) ? (defaultValues.images as string[])[0] || '' : '');

  const { register, handleSubmit, setValue, watch, reset, setError, clearErrors, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      active: true,
      featured: false,
      isNew: false,
      isOffer: false,
      stock: 0,
      price: 0,
      categoryId: '',
      brandId: ''
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const { salePrice: _sp, ...restDefaults } = defaultValues;
      reset(restDefaults);
      setGalleryImages(Array.isArray(defaultValues.images) ? (defaultValues.images as string[]).slice(1) : []);
      setMainImage(Array.isArray(defaultValues.images) ? (defaultValues.images as string[])[0] || '' : '');
      // Inicializar salePriceTempRef con el valor por defecto
      salePriceTempRef.current = defaultValues?.salePrice;
      // Si NO hay promo activa, NO resetear salePrice
      if (hasSalePrice) {
        reset({ ...restDefaults, salePrice: defaultValues.salePrice });
      } else {
        reset({ ...restDefaults, salePrice: undefined });
      }
    }
  }, [defaultValues, reset, hasSalePrice]);

  const featured = watch('featured');
  const active = watch('active');
  const isNew = watch('isNew');
  const isOffer = watch('isOffer');
  const hasInstallmentsInterest = watch('hasInstallmentsInterest');
  const isMadeToOrder = watch('isMadeToOrder');

  const previewUrl = getImageUrl(mainImage);

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
        setMainImage(url);
      } catch {} finally { setUploading(false); }
    };
    input.click();
  };

  const handleFormSubmit = (data: ProductFormData) => {
    console.log('[Submit] hasSalePrice:', hasSalePrice);
    console.log('[Submit] data.salePrice:', (data as any).salePrice);
    console.log('[Submit] data completo:', JSON.stringify(data));
    // Validacion antes de guardar
    if (hasSalePrice) {
      const rawValue = (data as any).salePrice;
      const numVal = Number(rawValue);
      if (rawValue === undefined || rawValue === null || rawValue === '' || isNaN(numVal) || numVal <= 0) {
        setError('salePrice', { type: 'manual', message: 'El precio promocional es obligatorio' });
        return;
      }
    }

    // Validar SKU duplicado en variantes
    const skuSet = new Set<string>();
    for (const v of variants) {
      if (v.sku && v.sku.trim()) {
        const skuLower = v.sku.trim().toLowerCase();
        if (skuSet.has(skuLower)) {
          alert('SKU duplicado en variantes: ' + v.sku);
          return;
        }
        skuSet.add(skuLower);
      }
    }

    const allImages = [mainImage, ...galleryImages].filter(Boolean) as string[];
    // Si checkbox desactivado, NO enviar salePrice
    if (!hasSalePrice) {
      const cleanData: any = { ...data };
      cleanData.salePrice = null; // Enviar null para que backend lo guarde como null
      onSave({ ...cleanData, images: allImages });
    } else {
      onSave({ ...data, images: allImages, variants });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col lg:flex-row gap-4 lg:gap-0">
      <div className="w-full lg:w-[220px] flex-shrink-0 flex flex-col gap-3">
        <div className="w-full h-[180px] sm:h-[220px] rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-300" />
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={mainImage}
            onChange={(e) => setMainImage(e.target.value)}
            className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
            placeholder="URL de imagen"
          />
          <button type="button" onClick={handleUpload} disabled={uploading} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 leading-tight">Medida recomendada: 800x800px (cuadrada). Fondo blanco. Peso maximo: 500KB.</p>
        <div className="mt-2">
          <label className={labelClass}>Imagenes secundarias</label>
          <div className="mt-1"><ImageGalleryInput images={galleryImages} onChange={setGalleryImages} /></div>
        </div>
      </div>

      <div className="hidden lg:block ml-7 mr-5 w-px bg-gray-200 self-stretch my-2" />

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-5 content-start">
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

        <div>
          <label className={labelClass}>Precio de Venta *</label>
          <input type="number" step="0.01" {...register('price')} className={inputClass + ' mt-1'} />
          {errors.price && <p className="text-xs text-red-600 mt-0.5">{errors.price.message}</p>}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <input
              type="checkbox"
              checked={hasSalePrice}
              onChange={(e) => {
                const checked = e.target.checked;
                console.log('[Checkbox] Nuevo estado:', checked);
                console.log('[Checkbox] Valor actual salePrice:', watch('salePrice'));
                console.log('[Checkbox] salePriceTempRef:', salePriceTempRef.current);
                setHasSalePrice(checked);
                if (!checked) {
                  clearErrors('salePrice');
                  const currentVal = watch('salePrice');
                  console.log('[Checkbox] Desactivando - guardando temp:', currentVal);
                  salePriceTempRef.current = typeof currentVal === 'number' ? currentVal : Number(currentVal);
                  setValue('salePrice', undefined as any, { shouldDirty: true, shouldValidate: false });
                  console.log('[Checkbox] Despues de setValue undefined - watch:', watch('salePrice'));
                } else {
                  console.log('[Checkbox] Activando - restaurando temp:', salePriceTempRef.current);
                  if (salePriceTempRef.current) {
                    setValue('salePrice', salePriceTempRef.current, { shouldDirty: true });
                    console.log('[Checkbox] Despues de restaurar - watch:', watch('salePrice'));
                  }
                }
              }}
              className="w-4 h-4 rounded accent-[#C8FF00] cursor-pointer"
              id="hasSalePrice"
            />
            <label htmlFor="hasSalePrice" className="text-xs font-medium text-gray-500 cursor-pointer select-none">
              Activar precio promocional
            </label>
          </div>
          <input
            type="number"
            step="0.01"
            {...register('salePrice', {
              validate: (val) => {
                if (hasSalePrice) {
                  const numVal = Number(val);
                  if (!val || isNaN(numVal) || numVal <= 0) {
                    return 'El precio promocional es obligatorio';
                  }
                }
                return true;
              }
            })}
            className={inputClass + ' mt-1 ' + (hasSalePrice ? '' : 'bg-gray-50 text-gray-400 cursor-not-allowed') + (errors.salePrice ? ' border-red-400 focus:ring-red-400/40 focus:border-red-400' : '')}
            placeholder={hasSalePrice ? 'Ej: 150000' : 'Desactivado'}
            readOnly={!hasSalePrice}
          />
          {errors.salePrice && <p className="text-xs text-red-600 mt-0.5">{errors.salePrice.message}</p>}
          {!hasSalePrice && <p className="text-[10px] text-gray-400 mt-1">Marca el checkbox para activar precio promocional.</p>}
        </div>
        <div>
          <label className={labelClass}>Precio Transferencia/Deposito</label>
          <input type="number" step="0.01" {...register('transferPrice')} className={inputClass + ' mt-1'} placeholder="Opcional" />
        </div>

        {!isMadeToOrder && (
          <>
            <div>
              <label className={labelClass}>% Descuento</label>
              <input type="number" step="0.1" min="0" max="100" {...register('discountPercentage')} className={inputClass + ' mt-1'} placeholder="Ej: 15" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Cuotas (Mercado Pago)</label>
              <select {...register('installments')} className={inputClass + ' mt-1'}>
                <option value="">Sin cuotas</option>
                <option value="3">3 cuotas</option>
                <option value="6">6 cuotas</option>
                <option value="9">9 cuotas</option>
                <option value="12">12 cuotas</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Interes en cuotas</label>
                <div className="flex items-center gap-2">
                  <Toggle checked={hasInstallmentsInterest} onChange={() => setValue('hasInstallmentsInterest', !hasInstallmentsInterest, { shouldDirty: true })} />
                  <span className={'text-xs font-medium ' + (hasInstallmentsInterest ? 'text-red-600' : 'text-gray-400')}>{hasInstallmentsInterest ? 'Con interes' : 'Sin interes'}</span>
                </div>
              </div>
              {hasInstallmentsInterest && (
                <div className="mt-2">
                  <label className={labelClass}>% Interes</label>
                  <input type="number" step="0.1" min="0" {...register('installmentsInterest')} className={inputClass + ' mt-1'} placeholder="Ej: 5" />
                </div>
              )}
            </div>
          </>
        )}

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

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
          <label className={labelClass}>Marca *</label>
          <select {...register('brandId')} className={inputClass + ' mt-1'}>
            <option value="">Seleccionar</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {errors.brandId && <p className="text-xs text-red-600 mt-0.5">{errors.brandId.message}</p>}
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 pt-1">
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

        <div className="sm:col-span-2 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className={labelClass}>Variantes (talles/colores)</label>
            <button
              type="button"
              onClick={() => setVariants([...variants, { sku: '', size: '', color: '', imageUrl: '', images: [], stock: 0 }])}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] transition-colors"
            >
              <Plus className="w-3 h-3" />Agregar variante
            </button>
          </div>
          
          {variants.length === 0 ? (
            <p className="text-xs text-gray-400">Sin variantes. Agrega talles o colores si este producto los necesita.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-start bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Talle *</label>
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[i].size = e.target.value;
                        setVariants(newVariants);
                      }}
                      className={inputClass + ' mt-0.5'}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Color</label>
                    <input
                      type="text"
                      value={v.color || ''}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[i].color = e.target.value;
                        setVariants(newVariants);
                      }}
                      className={inputClass + ' mt-0.5'}
                      placeholder="Negro, Blanco"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[i].stock = Number(e.target.value);
                        setVariants(newVariants);
                      }}
                      className={inputClass + ' mt-0.5'}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">SKU</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[i].sku = e.target.value;
                          setVariants(newVariants);
                        }}
                        className={inputClass + ' mt-0.5'}
                        placeholder="SKU-001"
                      />
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                        className="mt-0.5 p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
}
