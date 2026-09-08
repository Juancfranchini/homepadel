import { Plus, Trash2 } from 'lucide-react';

const inputClass = 'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export interface CompareField { label: string; type: 'stars' | 'text'; }

export default function CompareFieldsEditor({ fields, onAdd, onUpdate, onRemove }: {
  fields: CompareField[]; onAdd: () => void; onUpdate: (i: number, f: Partial<CompareField>) => void; onRemove: (i: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Caracteristicas a comparar</span>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]">
          <Plus size={12} />Agregar caracteristica
        </button>
      </div>
      {fields.map((field, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input value={field.label} onChange={(e) => onUpdate(i, { label: e.target.value })}
            className={inputClass + ' flex-1'} placeholder="Ej: Control" />
          <select value={field.type} onChange={(e) => onUpdate(i, { type: e.target.value as 'stars' | 'text' })}
            className={inputClass + ' w-28 text-xs'}>
            <option value="stars">Estrellas</option>
            <option value="text">Texto</option>
          </select>
          <button type="button" onClick={() => onRemove(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}
