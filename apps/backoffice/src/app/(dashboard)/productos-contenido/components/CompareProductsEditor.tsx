import { Plus, Trash2 } from 'lucide-react';
import CompareStarRating from './CompareStarRating';
import { CompareField } from './CompareFieldsEditor';

export interface CompareProduct { name: string; image?: string; values: number[]; }

export default function CompareProductsEditor({ fields, products, onAdd, onRemove, onNameChange, onStarChange, onTextChange }: {
  fields: CompareField[]; products: CompareProduct[]; onAdd: () => void; onRemove: (i: number) => void;
  onNameChange: (pi: number, name: string) => void; onStarChange: (pi: number, fi: number, val: number) => void; onTextChange: (pi: number, fi: number, val: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Productos a comparar</span><span className="text-[10px] text-gray-400">(minimo 2)</span></div>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]">
          <Plus size={12} />Agregar producto
        </button>
      </div>

      <div className="space-y-4">
        {products.map((prod, pi) => (
          <div key={pi} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <input value={prod.name} onChange={(e) => onNameChange(pi, e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] flex-1"
                placeholder="Nombre del producto" />
              <button type="button" onClick={() => onRemove(pi)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {fields.map((field, fi) => (
                <div key={fi} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500 font-medium flex-shrink-0">{field.label}</span>
                  <div className="flex-1 flex justify-end">
                    {field.type === 'stars' ? (
                      <CompareStarRating value={Number(prod.values[fi]) || 0} onChange={(v) => onStarChange(pi, fi, v)} />
                    ) : (
                      <input
                        value={typeof prod.values[fi] === 'string' ? prod.values[fi] as unknown as string : ''}
                        onChange={(e) => onTextChange(pi, fi, e.target.value)}
                        className="w-24 text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#C8FF00]/40 bg-white"
                        placeholder="Ej: Medio"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
