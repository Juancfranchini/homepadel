import { useFieldArray, UseFormRegister } from 'react-hook-form';
import Toggle from '../../testimonios/components/Toggle';
import { Plus, Trash2 } from 'lucide-react';
import SpecIconPicker from './SpecIconPicker';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

const PERF_LABELS = ['Control', 'Potencia', 'Manejabilidad', 'Dureza', 'Jugabilidad'];

interface Props {
  register: UseFormRegister<any>;
  control: any;
  watch: any;
  setValue: any;
  showPerformance: boolean;
  onToggleShowPerformance: () => void;
}

function SpecRow({ index, register, currentIcon, onIconChange, onRemove }: {
  index: number; register: UseFormRegister<any>; currentIcon: string;
  onIconChange: (value: string) => void; onRemove: () => void;
}) {
  const iconSelect = <SpecIconPicker value={currentIcon} onChange={onIconChange} />;

  return (
    <div className="mb-2">
      {/* Mobile */}
      <div className="sm:hidden grid grid-cols-2 gap-2 mb-2">
        {iconSelect}
        <input {...register(('specs.' + index + '.title') as any)} className={inputClass} placeholder="Ej: Carbono" />
      </div>
      <div className="sm:hidden flex gap-2">
        <input {...register(('specs.' + index + '.value') as any)} className={inputClass + ' flex-1 min-w-0'} placeholder="Descripcion del producto" />
        <button type="button" onClick={onRemove} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
      </div>

      {/* Tablet/Web */}
      <div className="hidden sm:grid grid-cols-[158px_90px_1fr_40px] gap-2 items-center">
        {iconSelect}
        <input {...register(('specs.' + index + '.title') as any)} className={inputClass} placeholder="Ej: Carbono" />
        <input {...register(('specs.' + index + '.value') as any)} className={inputClass + ' min-w-0'} placeholder="Descripcion del producto" />
        <button type="button" onClick={onRemove} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export default function RendimientoTab({ register, control, watch, setValue, showPerformance, onToggleShowPerformance }: Props) {
  const specsArray = useFieldArray({ control, name: 'specs' });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Barras de Rendimiento (0-100)</label>
          <div className="flex items-center gap-2"><Toggle checked={showPerformance} onChange={onToggleShowPerformance} /><span className="text-xs text-gray-400">{showPerformance ? "Activado" : "Desactivado"}</span></div>
        </div>
        {PERF_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3 mb-2">
            <span className="w-20 sm:w-28 text-sm text-gray-600 flex-shrink-0">{label}</span>
            <input type="range" min={0} max={100} {...register('performanceStats.' + i + '.value')} className="flex-1 accent-[#C8FF00] min-w-0" />
            <span className="w-8 sm:w-10 text-xs text-gray-500 text-right flex-shrink-0">{watch('performanceStats.' + i + '.value') || 0}%</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>Especificaciones (cards)</label>
          <button type="button" onClick={() => specsArray.append({ icon: 'Zap', title: '', value: '' })}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
        </div>

        {specsArray.fields.length > 0 && (
          <div className="hidden sm:grid grid-cols-[158px_90px_1fr_40px] gap-2 mb-1 px-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Icono</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Titulo</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Descripcion</span>
            <span></span>
          </div>
        )}

        {specsArray.fields.map((field, i) => (
          <SpecRow
            key={field.id}
            index={i}
            register={register}
            currentIcon={watch('specs.' + i + '.icon') || 'Zap'}
            onIconChange={(valor) => setValue('specs.' + i + '.icon', valor, { shouldDirty: true })}
            onRemove={() => specsArray.remove(i)}
          />
        ))}

        {specsArray.fields.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No hay especificaciones. Haz clic en Agregar.</p>
        )}
      </div>
    </div>
  );
}
