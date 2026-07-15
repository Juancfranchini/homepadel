'use client';

import { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

interface CompareField {
  label: string;
  type: 'stars' | 'text';
}

interface CompareProduct {
  name: string;
  image?: string;
  values: (number | string)[];
}

interface CompareData {
  fields: CompareField[];
  products: CompareProduct[];
}

interface Props {
  value: CompareData;
  onChange: (data: CompareData) => void;
}

export default function ComparaTab({ value, onChange }: Props) {
  const data: CompareData = value || { fields: [], products: [] };

  const addField = () => {
    onChange({ ...data, fields: [...data.fields, { label: '', type: 'stars' as const }] });
  };

  const updateField = (index: number, field: Partial<CompareField>) => {
    const fields = [...data.fields];
    fields[index] = { ...fields[index], ...field };
    onChange({ ...data, fields });
  };

  const removeField = (index: number) => {
    const fields = data.fields.filter((_, i) => i !== index);
    const products = data.products.map((p) => ({ ...p, values: p.values.filter((_, i) => i !== index) }));
    onChange({ ...data, fields, products });
  };

  const addProduct = () => {
    onChange({ ...data, products: [...data.products, { name: '', image: '', values: data.fields.map(() => data.fields[0]?.type === 'stars' ? 0 : '') }] });
  };

  const updateProduct = (index: number, field: string, val: any) => {
    const products = [...data.products];
    products[index] = { ...products[index], [field]: val };
    onChange({ ...data, products });
  };

  const updateProductValue = (prodIndex: number, fieldIndex: number, val: number | string) => {
    const products = [...data.products];
    products[prodIndex].values[fieldIndex] = val;
    onChange({ ...data, products });
  };

  const removeProduct = (index: number) => {
    const products = data.products.filter((_, i) => i !== index);
    onChange({ ...data, products });
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
              className={inputClass + ' w-32'}>
              <option value="stars">Estrellas</option>
              <option value="text">Texto</option>
            </select>
            <button type="button" onClick={() => removeField(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
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
          {data.products.map((prod, pi) => (
            <div key={pi} className="border border-gray-200 rounded-lg p-3 mb-2 space-y-2">
              <div className="flex gap-2 items-center">
                <input value={prod.name} onChange={(e) => updateProduct(pi, 'name', e.target.value)}
                  className={inputClass + ' flex-1'} placeholder="Nombre del producto" />
                <input value={prod.image || ''} onChange={(e) => updateProduct(pi, 'image', e.target.value)}
                  className={inputClass + ' w-32'} placeholder="URL imagen" />
                <button type="button" onClick={() => removeProduct(pi)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {data.fields.map((field, fi) => (
                  <div key={fi} className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 w-20 truncate">{field.label}:</span>
                    {field.type === 'stars' ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} max={5} step={0.5} value={prod.values[fi] as number}
                          onChange={(e) => updateProductValue(pi, fi, parseFloat(e.target.value) || 0)}
                          className={inputClass + ' w-16 text-center'} />
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => {
                            const val = prod.values[fi] as number || 0;
                            const filled = val >= s;
                            const half = val >= s - 0.5 && val < s;
                            return <Star key={s} className={'w-3 h-3 ' + (filled ? 'text-[#C8FF00] fill-[#C8FF00]' : half ? 'text-[#C8FF00] fill-[#C8FF00]/50' : 'text-gray-300')} />;
                          })}
                        </div>
                      </div>
                    ) : (
                      <input value={prod.values[fi] as string || ''} onChange={(e) => updateProductValue(pi, fi, e.target.value)}
                        className={inputClass + ' w-32'} placeholder="Ej: Medio" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
