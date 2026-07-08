'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

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
  description: z.string().optional(),
  images: z.string().optional(),
});
export type ProductFormData = z.infer<typeof schema>;

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

export default function ProductForm({ defaultValues, onSave, onCancel, saving, categories, brands }: Props) {
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { active: true, featured: false, isNew: false, isOffer: false, stock: 0, price: 0 },
  });

  const imageUrl = watch('images');
  const previewUrl = getImageUrl(imageUrl);

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
        setValue('images', url, { shouldDirty: true });
      } catch {} finally { setUploading(false); }
    };
    input.click();
  };

  const handleRemoveImage = () => {
    setValue('images', '', { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input {...register('name')} className={inputClass} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
          <input {...register('sku')} className={inputClass} />
          {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input type="number" step="0.01" {...register('price')} className={inputClass} />
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio oferta</label>
          <input type="number" step="0.01" {...register('salePrice')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" {...register('stock')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select {...register('categoryId')} className={inputClass}>
            <option value="">Seleccionar</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
          <select {...register('brandId')} className={inputClass}>
            <option value="">Seleccionar</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {errors.brandId && <p className="text-xs text-red-600 mt-1">{errors.brandId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
          <div className="flex gap-2">
            <input {...register('images')} className={inputClass} placeholder="https://... (URL)" />
            <button type="button" onClick={handleUpload} disabled={uploading} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <Upload className="w-4 h-4" />{uploading ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
          {previewUrl && (
            <div className="mt-2 relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <button type="button" onClick={handleRemoveImage} className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
        <textarea {...register('description')} rows={3} className={inputClass} />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2"><input type="checkbox" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Activo</label>
        <label className="flex items-center gap-2"><input type="checkbox" {...register('featured')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Destacado</label>
        <label className="flex items-center gap-2"><input type="checkbox" {...register('isNew')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Nuevo</label>
        <label className="flex items-center gap-2"><input type="checkbox" {...register('isOffer')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Oferta</label>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
