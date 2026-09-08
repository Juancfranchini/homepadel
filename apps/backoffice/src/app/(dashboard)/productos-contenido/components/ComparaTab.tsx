'use client';

import Toggle from '../../testimonios/components/Toggle';
import CompareFieldsEditor, { CompareField } from './CompareFieldsEditor';
import CompareProductsEditor, { CompareProduct } from './CompareProductsEditor';

interface CompareData { fields: CompareField[]; products: CompareProduct[]; }
interface Props { value: CompareData; onChange: (data: CompareData) => void; showCompare: boolean; onToggleShowCompare: () => void; }

export default function ComparaTab({ value, onChange, showCompare, onToggleShowCompare }: Props) {
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
    const vals = data.fields.map(() => 0);
    onChange({ ...data, products: [...data.products, { name: '', image: '', values: vals }] });
  };
  const removeProduct = (i: number) => onChange({ ...data, products: data.products.filter((_, x) => x !== i) });

  const updateProductValue = (pi: number, fi: number, val: number | string) => {
    const products = data.products.map((p, idx) => {
      if (idx !== pi) return p;
      const newVals = [...p.values];
      newVals[fi] = val as any;
      return { ...p, values: newVals };
    });
    onChange({ ...data, products });
  };

  const updateProductName = (pi: number, name: string) => {
    const products = [...data.products];
    products[pi] = { ...products[pi], name };
    onChange({ ...data, products });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Comparar Modelos</span>
        <div className="flex items-center gap-2">
          <Toggle checked={showCompare} onChange={onToggleShowCompare} />
          <span className="text-xs text-gray-400">{showCompare ? 'Activado' : 'Desactivado'}</span>
        </div>
      </div>

      <CompareFieldsEditor fields={data.fields} onAdd={addField} onUpdate={updateField} onRemove={removeField} />

      {data.fields.length > 0 && (
        <CompareProductsEditor
          fields={data.fields}
          products={data.products}
          onAdd={addProduct}
          onRemove={removeProduct}
          onNameChange={updateProductName}
          onStarChange={updateProductValue}
          onTextChange={updateProductValue}
        />
      )}
    </div>
  );
}
