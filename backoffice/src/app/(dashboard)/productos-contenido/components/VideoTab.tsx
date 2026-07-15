import { useFieldArray, UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

interface Props {
  register: UseFormRegister<any>;
  control: any;
}

export default function VideoTab({ register, control }: Props) {
  const relatedVideosArray = useFieldArray({ control, name: 'relatedVideos' });

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Video Principal (YouTube/Vimeo)</label>
        <input {...register('videoUrl')} className={inputClass + ' mt-1'} placeholder="https://youtu.be/abc123" />
      </div>
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Videos Relacionados</label>
          <button type="button" onClick={() => relatedVideosArray.append({ title: '', url: '' })}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Aparecen debajo de "Por que elegir este producto".</p>
        {relatedVideosArray.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input {...register(('relatedVideos.' + i + '.title') as any)} className={inputClass + ' flex-1'} placeholder={'Titulo ' + (i + 1)} />
            <input {...register(('relatedVideos.' + i + '.url') as any)} className={inputClass + ' flex-1'} placeholder="https://youtu.be/..." />
            <button type="button" onClick={() => relatedVideosArray.remove(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
