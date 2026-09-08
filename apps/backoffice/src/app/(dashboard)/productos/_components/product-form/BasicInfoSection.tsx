import { Package } from 'lucide-react';
import { SectionCard, Label, ErrorMsg } from './shared';
import { Category, Brand } from './schema';

export default function BasicInfoSection({ register, errors, categories, brands }: {
  register: any; errors: any; categories: Category[]; brands: Brand[];
}) {
  return (
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
          <p className="text-xs text-gray-400 mt-1">Identificador único del producto</p>
        </div>

        <div>
          <Label>Stock disponible</Label>
          <input type="number" min={0} {...register('stock')} className="input-field" />
        </div>

        <div>
          <Label required>Categoría</Label>
          <select {...register('categoryId')} className="input-field pr-10">
            <option value="">Seleccionar categoría</option>
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
          <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Descripción detallada del producto..." />
        </div>
      </div>
    </SectionCard>
  );
}
