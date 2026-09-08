import { VariantData } from './VariantEditor';

export function VariantSizeColor({ v, inputClass, hasSize, hasColor, onUpdate }: {
  v: VariantData; inputClass: string; hasSize: boolean; hasColor: boolean; onUpdate: (field: keyof VariantData, value: any) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <div className="flex flex-col justify-end">
        {hasSize && <>
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-400 uppercase">Talle *</label>
            {!v.size && <span className="text-[10px] text-red-500">Requerido</span>}
          </div>
          <input type="text" value={v.size} onChange={(e) => onUpdate('size', e.target.value)} className={inputClass + ' !py-1.5'} placeholder="S, M, L, XL" />
        </>}
      </div>
      <div className="flex flex-col justify-end">
        {hasColor && <>
          <label className="text-[10px] text-gray-400 uppercase">Color</label>
          <input type="text" value={v.color || ''} onChange={(e) => onUpdate('color', e.target.value)} className={inputClass + ' !py-1.5'} placeholder="Negro, Blanco" />
        </>}
      </div>
    </div>
  );
}

export function VariantDimensions({ v, inputClass, onUpdate }: { v: VariantData; inputClass: string; onUpdate: (field: keyof VariantData, value: any) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-gray-400 uppercase">Dimensiones *</label>
      <div className="grid grid-cols-4 gap-1">
        {(['dimensionLength', 'dimensionWidth', 'dimensionHeight'] as const).map((field, index) => (
          <input key={field} type="number" min="0" step="any" value={v[field] ?? ''} onChange={(e) => onUpdate(field, e.target.value === '' ? undefined : Number(e.target.value))} className={inputClass + ' !py-1.5'} placeholder={['Largo', 'Ancho', 'Alto'][index]} />
        ))}
        <select value={v.dimensionUnit || 'cm'} onChange={(e) => onUpdate('dimensionUnit', e.target.value)} className={inputClass + ' !py-1.5'}>
          {['mm', 'cm', 'm', 'in'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
        </select>
      </div>
    </div>
  );
}

export function VariantWeight({ v, inputClass, onUpdate }: { v: VariantData; inputClass: string; onUpdate: (field: keyof VariantData, value: any) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-gray-400 uppercase">Peso *</label>
      <div className="grid grid-cols-[1fr_auto] gap-1">
        <input type="number" min="0" step="any" value={v.weight ?? ''} onChange={(e) => onUpdate('weight', e.target.value === '' ? undefined : Number(e.target.value))} className={inputClass + ' !py-1.5'} placeholder="Peso" />
        <select value={v.weightUnit || 'kg'} onChange={(e) => onUpdate('weightUnit', e.target.value)} className={inputClass + ' !py-1.5'}>
          {['mg', 'g', 'kg', 'lb'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
        </select>
      </div>
    </div>
  );
}

export function VariantStockSku({ v, inputClass, onUpdate }: { v: VariantData; inputClass: string; onUpdate: (field: keyof VariantData, value: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <div className="flex flex-col justify-end">
        <label className="text-[10px] text-gray-400 uppercase">Stock</label>
        <input type="number" value={v.stock} onChange={(e) => onUpdate('stock', Number(e.target.value))} className={inputClass + ' !py-1.5'} placeholder="0" min="0" />
      </div>
      <div className="flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-gray-400 uppercase">SKU *</label>
          {!v.sku && <span className="text-[10px] text-red-500">Requerido</span>}
        </div>
        <input type="text" value={v.sku} onChange={(e) => onUpdate('sku', e.target.value)} className={inputClass + ' !py-1.5'} placeholder="SKU-001" />
      </div>
    </div>
  );
}
