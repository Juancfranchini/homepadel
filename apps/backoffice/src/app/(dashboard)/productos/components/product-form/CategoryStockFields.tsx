import Toggle from '../../../testimonios/components/Toggle';
import { inputClass, labelClass, Category, Brand } from './schema';

export function StockOrLeadTimeField({ register, isMadeToOrder }: { register: any; isMadeToOrder: boolean }) {
  if (!isMadeToOrder) {
    return (
      <div>
        <label className={labelClass}>Stock</label>
        <input type="number" {...register('stock')} className={inputClass + ' mt-1'} />
      </div>
    );
  }
  return (
    <div>
      <label className={labelClass}>Dias estimados de fabricacion</label>
      <input type="number" {...register('estimatedDays')} className={inputClass + ' mt-1'} placeholder="Ej: 20" />
    </div>
  );
}

export function CategoryField({ register, errors, categories }: { register: any; errors: any; categories: Category[] }) {
  return (
    <div>
      <label className={labelClass}>Categoria *</label>
      <select {...register('categoryId')} className={inputClass + ' mt-1'}>
        <option value="">Seleccionar</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {errors.categoryId && <p className="text-xs text-red-600 mt-0.5">{errors.categoryId.message}</p>}
    </div>
  );
}

export function MadeToOrderField({ isMadeToOrder, onToggle, register }: { isMadeToOrder: boolean; onToggle: () => void; register: any }) {
  return (
    <div className="sm:col-span-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>Producto por encargo</label>
        <div className="flex items-center gap-2">
          <Toggle checked={isMadeToOrder} onChange={onToggle} />
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
  );
}

export function BrandField({ register, errors, brands }: { register: any; errors: any; brands: Brand[] }) {
  return (
    <div className="sm:col-span-2">
      <label className={labelClass}>Marca *</label>
      <select {...register('brandId')} className={inputClass + ' mt-1'}>
        <option value="">Seleccionar</option>
        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      {errors.brandId && <p className="text-xs text-red-600 mt-0.5">{errors.brandId.message}</p>}
    </div>
  );
}
