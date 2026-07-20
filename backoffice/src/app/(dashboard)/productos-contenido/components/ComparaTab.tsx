'use client';

import { Plus, Trash2, Star, Minus } from 'lucide-react';

const inputClass = 'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

interface CompareField { label: string; type: 'stars' | 'text'; }
interface CompareProduct { name: string; image?: string; values: number[]; }
interface CompareData { fields: CompareField[]; products: CompareProduct[]; }
interface Props { value: CompareData; onChange: (data: CompareData) => void; }

function StarIcon({ filled, half }: { filled: boolean; half: boolean }) {
  if (filled) return <Star size={12} fill="#C8FF00" stroke="#C8FF00" />;
  if (half) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id={'half-star'}>
            <stop offset="50%" stopColor="#C8FF00" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill="url(#half-star)" />
      </svg>
    );
  }
  return <Star size={12} fill="none" stroke="#D1D5DB" />;
}

export default function ComparaTab({ value, onChange }: Props) {
  const data: CompareData = value || { fields: [], products: [] };

  const addField = () => onChange({ ...data, fields: [...data.fields, { label: '', type: 'stars' }] });
  const removeField = (i: number) => {
    const fields = data.fields.filter((_, x) => x !== i);
    const products = data.products.map((p) => ({ ...p, values: p.values.filter((_, x) => x !== i) }));
    onChange({ ...data, fields, products });
  };
  const updateField = (i: number, f: Partial<CompareField>) => {
    const fields = [...data.fields]; fields[i] = { ...fields[i], ...f }; onChange({ ...data, fields });
  };

  const addProduct = () => {
    const vals = data.fields.map((f) => f.type === 'stars' ? 0 : 0);
    onChange({ ...data, products: [...data.products, { name: '', image: '', values: vals }] });
  };
  const removeProduct = (i: number) => {
    onChange({ ...data, products: data.products.filter((_, x) => x !== i) });
  };

  const setStar = (pi: number, fi: number, val: number) => {
    const products = data.products.map((p, idx) => {
      if (idx !== pi) return p;
      const newVals = [...p.values];
      newVals[fi] = val;
      return { ...p, values: newVals };
    });
    onChange({ ...data, products });
  };

  const StarDisplay = ({ pi, fi }: { pi: number; fi: number }) => {
    const val = Number(data.products[pi]?.values[fi]) || 0;
    return (
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => setStar(pi, fi, Math.max(0, val - 0.5))}
          className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center">
          <Minus size={12} className="text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-900 w-5 text-center">{val}</span>
        <button type="button" onClick={() => setStar(pi, fi, Math.min(5, val + 0.5))}
          className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center">
          <Plus size={12} className="text-gray-500" />
        </button>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map((s) => (
            <StarIcon key={s}
              filled={val >= s}
              half={val >= s - 0.5 && val < s}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Caracteristicas</span>
          <button type="button" onClick={addField}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
        </div>
        {data.fields.map((field, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input value={field.label} onChange={(e) => updateField(i, { label: e.target.value })}
              className={inputClass + ' flex-1'} placeholder="Ej: Control" />
            <select value={field.type} onChange={(e) => updateField(i, { type: e.target.value as 'stars' | 'text' })}
              className={inputClass + ' flex-1 text-xs'}>
              <option value="stars">Estrellas</option>
              <option value="text">Texto</option>
            </select>
            <button type="button" onClick={() => removeField(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {data.fields.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Productos a comparar</span>
            <button type="button" onClick={addProduct}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
          </div>
          <div className="space-y-3">
            {data.products.map((prod, pi) => (
              <div key={pi} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <input value={prod.name} onChange={(e) => {
                    const products = [...data.products];
                    products[pi] = { ...products[pi], name: e.target.value };
                    onChange({ ...data, products });
                  }} className={inputClass + ' flex-1'} placeholder="Nombre del producto" />
                  <div className="flex-1 flex items-center gap-3 flex-wrap">
                    {data.fields.map((field, fi) => (
                      <div key={fi} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-gray-500 font-medium">{field.label}</span>
                        {field.type === 'stars' ? (
                          <StarDisplay pi={pi} fi={fi} />
                        ) : (
                          <input
                            value={typeof prod.values[fi] === 'string' ? prod.values[fi] as string : ''}
                            onChange={(e) => {
                              const products = data.products.map((p, idx) => {
                                if (idx !== pi) return p;
                                const newVals = [...p.values];
                                newVals[fi] = e.target.value as any;
                                return { ...p, values: newVals };
                              });
                              onChange({ ...data, products });
                            }}
                            className="w-24 text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#C8FF00]/40 bg-white" placeholder="Ej: Medio" />
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => removeProduct(pi)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0 self-center"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
