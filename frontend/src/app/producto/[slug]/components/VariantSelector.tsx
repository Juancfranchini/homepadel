'use client';

interface Variant {
  id: string;
  sku: string;
  size: string;
  color?: string | null;
  imageUrl?: string | null;
  stock: number;
  active: boolean;
}

interface Props {
  variants: Variant[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: string | null) => void;
}

export default function VariantSelector({ variants, selectedColor, selectedSize, onColorChange, onSizeChange }: Props) {
  if (!variants || variants.length === 0) return null;

  const colors = [...new Set(variants.filter(v => v.color).map(v => v.color as string))];

  const availableSizes = selectedColor
    ? variants.filter(v => v.color === selectedColor && v.stock > 0).map(v => v.size)
    : [...new Set(variants.filter(v => v.stock > 0).map(v => v.size))];

  return (
    <div className="flex flex-col gap-3">
      {colors.length > 0 && (
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

      <div>
        <p className="text-xs sm:text-sm font-semibold text-[#F7F6F7] mb-2">
          Talle: {selectedSize || 'Seleccionar'}
        </p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(size)}
              className={'min-w-[48px] px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide border transition-all ' +
                (selectedSize === size
                  ? 'bg-[#B7D31A] text-[#050606] border-[#B7D31A]'
                  : 'bg-[#1A1F21] text-[#C7C7C0] border-[#0D0F0F] hover:border-[#8A8A85]')}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {selectedColor && selectedSize && (
        <p className="text-[10px] text-[#8A8A85]">
          Stock disponible: {
            variants.find(v => v.color === selectedColor && v.size === selectedSize)?.stock ?? 0
          } unidades
        </p>
      )}
    </div>
  );
}