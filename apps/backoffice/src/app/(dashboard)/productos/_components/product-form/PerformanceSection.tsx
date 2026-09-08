import { Plus, Trash2, GripVertical, BarChart2 } from 'lucide-react';
import { SectionCard } from './shared';

export default function PerformanceSection({ register, watch, perfArray }: { register: any; watch: any; perfArray: any }) {
  return (
    <SectionCard icon={<BarChart2 className="w-4 h-4" />} title="Estadísticas de rendimiento">
      <p className="text-xs text-gray-500 -mt-2 mb-2">Valores del 0 al 100. Se muestran como barras de progreso en el detalle del producto.</p>
      <div className="space-y-3">
        {perfArray.fields.map((field: any, idx: number) => (
          <div key={field.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
            <div className="grid grid-cols-2 gap-2">
              <input {...register(`performanceStats.${idx}.label`)} className="input-field text-sm" placeholder="Etiqueta (ej: Control)" />
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={100} {...register(`performanceStats.${idx}.value`)} className="flex-1 accent-[#C8FF00]" />
                <span className="text-sm font-bold text-gray-700 w-8 text-right">{watch(`performanceStats.${idx}.value`) ?? 0}</span>
              </div>
            </div>
            <GripVertical className="w-4 h-4 text-gray-300" />
            <button type="button" onClick={() => perfArray.remove(idx)} className="p-1 text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => perfArray.append({ label: '', value: 75 })} className="flex items-center gap-1.5 text-sm text-[#0f172a] hover:text-gray-600 font-medium mt-1">
        <Plus className="w-4 h-4" /> Agregar estadística
      </button>
    </SectionCard>
  );
}
