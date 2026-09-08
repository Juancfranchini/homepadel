'use client';

import { Plus } from 'lucide-react';
import { useVariantEditor } from './useVariantEditor';
import VariantRow from './VariantRow';

export interface VariantData {
  id?: string;
  sku: string;
  size: string;
  color?: string;
  dimensions?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  dimensionUnit?: string;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  images?: string[];
  stock: number;
}

interface Props {
  variants: VariantData[];
  onChange: (variants: VariantData[]) => void;
  inputClass: string;
  hasSize: boolean;
  hasColor: boolean;
  hasDimensions: boolean;
  hasWeight: boolean;
}

export default function VariantEditor({ variants, onChange, inputClass, hasSize, hasColor, hasDimensions, hasWeight }: Props) {
  const { uploadingIndex, addVariant, updateVariant, removeVariant, addImage, removeImage, updateImage, handleUpload } = useVariantEditor(variants, onChange);

  return (
    <div className="sm:col-span-2 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Variantes (talles/colores)</label>
        <button type="button" onClick={addVariant} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-3 h-3" />Agregar variante
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-gray-400">Sin variantes. Agrega talles o colores si este producto los necesita.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {variants.map((v, i) => (
            <VariantRow
              key={i}
              v={v}
              index={i}
              inputClass={inputClass}
              hasSize={hasSize}
              hasColor={hasColor}
              hasDimensions={hasDimensions}
              hasWeight={hasWeight}
              uploadingIndex={uploadingIndex}
              onUpdate={updateVariant}
              onRemove={removeVariant}
              onAddImage={addImage}
              onRemoveImage={removeImage}
              onUpdateImage={updateImage}
              onUpload={handleUpload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
