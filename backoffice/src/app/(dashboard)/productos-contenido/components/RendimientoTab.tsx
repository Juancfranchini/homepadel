import { useFieldArray, UseFormRegister } from 'react-hook-form';
import { createElement } from 'react';
import { Plus, Trash2, Target, Circle, Scale, Ruler, User, Zap, Star, Shield, Award, Gauge, Wind, Package, Thermometer, Droplets, Maximize, Layers, Scissors, TrendingUp, Footprints } from 'lucide-react';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

const SPEC_ICONS = [
  { value: 'Target', label: 'Objetivo', icon: Target }, { value: 'Circle', label: 'Circulo', icon: Circle },
  { value: 'Scale', label: 'Balance', icon: Scale }, { value: 'Ruler', label: 'Regla', icon: Ruler },
  { value: 'User', label: 'Usuario', icon: User }, { value: 'Zap', label: 'Rayo', icon: Zap },
  { value: 'Star', label: 'Estrella', icon: Star }, { value: 'Shield', label: 'Escudo', icon: Shield },
  { value: 'Award', label: 'Premio', icon: Award }, { value: 'Gauge', label: 'Medidor', icon: Gauge },
  { value: 'Wind', label: 'Viento', icon: Wind }, { value: 'Package', label: 'Caja', icon: Package },
  { value: 'Thermometer', label: 'Termico', icon: Thermometer }, { value: 'Droplets', label: 'Gotas', icon: Droplets },
  { value: 'Maximize', label: 'Expandir', icon: Maximize }, { value: 'Layers', label: 'Capas', icon: Layers },
  { value: 'Scissors', label: 'Tijeras', icon: Scissors }, { value: 'TrendingUp', label: 'Tendencia', icon: TrendingUp },
  { value: 'Footprints', label: 'Huellas', icon: Footprints },
];

const PERF_LABELS = ['Control', 'Potencia', 'Manejabilidad', 'Dureza', 'Jugabilidad'];

interface Props {
  register: UseFormRegister<any>;
  control: any;
  watch: any;
}

export default function RendimientoTab({ register, control, watch }: Props) {
  const specsArray = useFieldArray({ control, name: 'specs' });

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass + ' mb-2'}>Barras de Rendimiento (0-100)</label>
        {PERF_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <span className="w-28 text-sm text-gray-600 flex-shrink-0">{label}</span>
            <input type="range" min={0} max={100} {...register('performanceStats.' + i + '.value')} className="flex-1 accent-[#C8FF00]" />
            <span className="w-10 text-xs text-gray-500 text-right">{watch('performanceStats.' + i + '.value') || 0}%</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>Especificaciones (cards)</label>
          <button type="button" onClick={() => specsArray.append({ icon: 'Target', title: '', value: '' })}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
        </div>

        {specsArray.fields.length > 0 && (
          <div className="flex gap-2 mb-1 px-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase w-[130px] flex-shrink-0">Icono</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase w-[90px] flex-shrink-0">Titulo</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase flex-1">Descripcion</span>
            <span className="w-8 flex-shrink-0"></span>
          </div>
        )}

        {specsArray.fields.map((field, i) => {
          const currentIcon = watch('specs.' + i + '.icon') || 'Target';
          const iconObj = SPEC_ICONS.find((o) => o.value === currentIcon);
          const IconComp = iconObj?.icon || Target;

          return (
            <div key={field.id} className="flex gap-2 mb-2 items-center">
              <div className="relative w-[130px] flex-shrink-0">
                <select {...register(('specs.' + i + '.icon') as any)} className={inputClass + ' text-xs pl-8 pr-2'}>
                  {SPEC_ICONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#C8FF00] pointer-events-none">
                  {createElement(IconComp, { size: 14 })}
                </span>
              </div>
              <input {...register(('specs.' + i + '.title') as any)} className={inputClass + ' w-[90px] flex-shrink-0'} placeholder="Ej: Carbono" />
              <input {...register(('specs.' + i + '.value') as any)} className={inputClass + ' flex-1'} placeholder="Ej: 18 K" />
              <button type="button" onClick={() => specsArray.remove(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
