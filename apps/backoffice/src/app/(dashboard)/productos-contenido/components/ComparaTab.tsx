'use client';

import Toggle from '../../testimonios/components/Toggle';
import CompareFieldsEditor, { CompareField } from './CompareFieldsEditor';
import CompareProductsEditor, { CompareProduct } from './CompareProductsEditor';
import { Product } from '../useProductosContenido';

interface CompareData { fields: CompareField[]; products: CompareProduct[]; }
interface Props {
  value: CompareData;
  onChange: (data: CompareData) => void;
  /** Catálogo completo, para comparar contra un producto que ya existe. */
  catalogo: Product[];
  showCompare: boolean;
  onToggleShowCompare: () => void;
}

/** Las barras de rendimiento van de 0 a 100 y la comparación en 5 estrellas. */
function aEstrellas(valor: number): number {
  return Math.round((Math.max(0, Math.min(100, valor)) / 20) * 2) / 2;
}

export default function ComparaTab({ value, onChange, catalogo, showCompare, onToggleShowCompare }: Props) {
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

  /**
   * Al elegir un producto del catálogo se copian sus barras de rendimiento a
   * las características cuyo nombre coincida —"Control" con "Control"—, así no
   * hay que volver a cargar a mano lo que ya está cargado en ese producto. Las
   * características que no coinciden quedan como estaban.
   */
  const pickProduct = (pi: number, producto: Product) => {
    const stats = producto.performanceStats || [];
    const previos = data.products[pi]?.values || [];

    const values = data.fields.map((field, fi) => {
      if (field.type !== 'stars') return previos[fi] ?? '';
      const stat = stats.find((s) => s.label?.trim().toLowerCase() === field.label.trim().toLowerCase());
      return stat ? aEstrellas(Number(stat.value)) : (previos[fi] ?? 0);
    });

    const products = [...data.products];
    products[pi] = { name: producto.name, image: producto.images?.[0] || '', values };
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
          catalogo={catalogo}
          onAdd={addProduct}
          onRemove={removeProduct}
          onNameChange={updateProductName}
          onPickProduct={pickProduct}
          onStarChange={updateProductValue}
          onTextChange={updateProductValue}
        />
      )}
    </div>
  );
}
