import { inputClass, labelClass } from './schema';

export default function VariantPropertiesSection({ register, hasSize, hasColor, hasDimensions, hasWeight }: {
  register: any; hasSize: boolean; hasColor: boolean; hasDimensions: boolean; hasWeight: boolean;
}) {
  return (
    <>
      <div className="sm:col-span-2 border-t border-gray-100 pt-4">
        <label className={labelClass}>Propiedades de variantes</label>
        <div className="flex flex-wrap gap-4 mt-2">
          {([
            ['hasSize', 'Talle', hasSize],
            ['hasColor', 'Color', hasColor],
            ['hasDimensions', 'Dimensiones', hasDimensions],
            ['hasWeight', 'Peso', hasWeight],
          ] as const).map(([name, label]) => (
            <label key={name} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" {...register(name)} className="w-4 h-4 rounded accent-[#C8FF00]" />
              {label}
            </label>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Solo se mostrarán en cada variante las propiedades activadas.</p>
      </div>
      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-gray-100 pb-4">
        {hasSize && <div>
          <label className={labelClass}>Talle del producto</label>
          <input {...register('size')} className={inputClass + ' mt-1'} placeholder="Ej: Único, M, 42" />
        </div>}
        {hasColor && <div>
          <label className={labelClass}>Color del producto</label>
          <input {...register('color')} className={inputClass + ' mt-1'} placeholder="Ej: Negro" />
        </div>}
        {hasDimensions && <div className="sm:col-span-2">
          <label className={labelClass}>Dimensiones del producto</label>
          <div className="grid grid-cols-4 gap-2 mt-1">
            <input type="number" step="any" disabled={!hasDimensions} {...register('dimensionLength')} className={inputClass} placeholder="Largo" />
            <input type="number" step="any" disabled={!hasDimensions} {...register('dimensionWidth')} className={inputClass} placeholder="Ancho" />
            <input type="number" step="any" disabled={!hasDimensions} {...register('dimensionHeight')} className={inputClass} placeholder="Alto" />
            <select {...register('dimensionUnit')} className={inputClass}>
              {['mm', 'cm', 'm', 'in'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>
        </div>}
        {hasWeight && <div>
          <label className={labelClass}>Peso del producto</label>
          <div className="grid grid-cols-[1fr_auto] gap-2 mt-1">
            <input type="number" step="any" disabled={!hasWeight} {...register('weight')} className={inputClass} placeholder="Peso" />
            <select {...register('weightUnit')} className={inputClass}>
              {['mg', 'g', 'kg', 'lb'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>
        </div>}
      </div>
    </>
  );
}
