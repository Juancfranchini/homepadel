import { useFieldArray, UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

interface Props {
  register: UseFormRegister<any>;
  control: any;
}

export default function HighlightsTab({ register, control }: Props) {
  const highlightsArray = useFieldArray({ control, name: 'highlights' });

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Titulo de la seccion</label>
        <input {...register('highlightsTitle')} className={inputClass + ' mt-1'} placeholder="POR QUE ELEGIR ESTE PRODUCTO" />
      </div>
      <div>
        <label className={labelClass}>Descripcion</label>
        <textarea {...register('highlightsDescription')} rows={2} className={inputClass + ' mt-1'} placeholder="Descubri por que este producto es la mejor opcion..." />
      </div>
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Checklist</label>
          <button type="button" onClick={() => highlightsArray.append({ text: '' })}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
        </div>
        {highlightsArray.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input {...register(('highlights.' + i + '.text') as any)} className={inputClass} placeholder={'Beneficio ' + (i + 1)} />
            <button type="button" onClick={() => highlightsArray.remove(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
