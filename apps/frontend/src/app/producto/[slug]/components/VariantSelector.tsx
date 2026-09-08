'use client';

import VariantOptionPicker from './VariantOptionPicker';

interface Variant {
  id: string;
  sku: string;
  size: string;
  color?: string | null;
  dimensions?: string | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  dimensionUnit?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
  imageUrl?: string | null;
  stock: number;
  active: boolean;
}

interface Props {
  variants: Variant[];
  selectedColor: string | null;
  selectedSize: string | null;
  selectedDimensions: string | null;
  selectedWeight: string | null;
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onDimensionsChange: (dimensions: string | null) => void;
  onWeightChange: (weight: string | null) => void;
  hasSize: boolean;
  hasColor: boolean;
  hasDimensions: boolean;
  hasWeight: boolean;
}

export const dimensionLabel = (v: Variant) => v.dimensions || (v.dimensionLength && v.dimensionWidth && v.dimensionHeight ? `${v.dimensionLength} x ${v.dimensionWidth} x ${v.dimensionHeight} ${v.dimensionUnit || ''}`.trim() : '');
export const weightLabel = (v: Variant) => v.weight == null ? '' : `${v.weight} ${v.weightUnit || ''}`.trim();

export default function VariantSelector({ variants, selectedColor, selectedSize, selectedDimensions, selectedWeight, onColorChange, onSizeChange, onDimensionsChange, onWeightChange, hasSize, hasColor, hasDimensions, hasWeight }: Props) {
  if (!variants || variants.length === 0) return null;

  const colors = [...new Set(variants.filter(v => v.color).map(v => v.color as string))];

  const availableSizes = selectedColor
    ? variants.filter(v => v.color === selectedColor && v.stock > 0).map(v => v.size)
    : [...new Set(variants.filter(v => v.stock > 0).map(v => v.size))];
  const availableDimensions = selectedColor
    ? variants.filter(v => v.color === selectedColor && v.stock > 0).map(dimensionLabel).filter(Boolean)
    : [...new Set(variants.filter(v => v.stock > 0).map(dimensionLabel).filter(Boolean))];
  const availableWeights = [...new Set(variants.filter(v => v.stock > 0).map(weightLabel).filter(Boolean))];

  return (
    <div className="flex flex-col gap-3">
      {hasColor && colors.length > 0 && (
        <div>
          <p className="text-xs sm:text-sm font-semibold text-[#F7F6F7] mb-2">
            Color: {selectedColor || 'Seleccionar'}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onColorChange(color);
                  onSizeChange(null);
                  onDimensionsChange(null);
                  onWeightChange(null);
                }}
                className={'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide border transition-all ' +
                  (selectedColor === color
                    ? 'bg-[#B7D31A] text-[#050606] border-[#B7D31A]'
                    : 'bg-[#1A1F21] text-[#C7C7C0] border-[#0D0F0F] hover:border-[#8A8A85]')}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSize && (
        <VariantOptionPicker label="Talle" selected={selectedSize} options={availableSizes} onChange={onSizeChange} minWidth />
      )}

      {hasDimensions && (
        <VariantOptionPicker label="Dimensiones" selected={selectedDimensions} options={availableDimensions} onChange={onDimensionsChange} />
      )}

      {hasWeight && (
        <VariantOptionPicker label="Peso" selected={selectedWeight} options={availableWeights} onChange={onWeightChange} />
      )}

      {(selectedColor || selectedSize || selectedDimensions || selectedWeight) && (
        <p className="text-[10px] text-[#8A8A85]">
          Stock disponible: {
            variants.find(v =>
              (!hasColor || v.color === selectedColor) &&
              (!hasSize || v.size === selectedSize) &&
              (!hasDimensions || dimensionLabel(v) === selectedDimensions)
              && (!hasWeight || weightLabel(v) === selectedWeight)
            )?.stock ?? 0
          } unidades
        </p>
      )}
    </div>
  );
}