import { Plus, Trash2, Zap } from 'lucide-react';
import { SectionCard } from './shared';

export default function FeaturesSection({ register, featuresArray }: { register: any; featuresArray: any }) {
  return (
    <SectionCard icon={<Zap className="w-4 h-4" />} title="Características destacadas">
      <p className="text-xs text-gray-500 -mt-2 mb-2">Cards de características técnicas que se muestran debajo de las barras de rendimiento.</p>
      <div className="space-y-3">
        {featuresArray.fields.map((field: any, idx: number) => (
          <div key={field.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start bg-gray-50 p-3 rounded-lg">
            <input {...register(`features.${idx}.icon`)} className="w-10 h-9 border border-gray-200 rounded-lg text-center text-base bg-white" placeholder="⚡" />
            <input {...register(`features.${idx}.title`)} className="input-field text-sm" placeholder="Título (ej: Carbono 18K)" />
            <input {...register(`features.${idx}.subtitle`)} className="input-field text-sm" placeholder="Subtítulo (ej: Alta resistencia)" />
            <button type="button" onClick={() => featuresArray.remove(idx)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors mt-0.5">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => featuresArray.append({ icon: '', title: '', subtitle: '' })} className="flex items-center gap-1.5 text-sm text-[#0f172a] hover:text-gray-600 font-medium mt-1">
        <Plus className="w-4 h-4" /> Agregar característica
      </button>
    </SectionCard>
  );
}
