'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { dimensionLabel, weightLabel } from './components/VariantSelector';

export function useProductVariants(product: Product | null) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);

  // Auto-seleccionar talla única al seleccionar color
  useEffect(() => {
    if (selectedColor && !selectedSize && product?.hasSize && product?.variants) {
      const colorVariants = product.variants.filter(v => v.color === selectedColor && v.active);
      if (colorVariants.length === 1 && colorVariants[0].size) {
        setSelectedSize(colorVariants[0].size);
      }
    }
  }, [selectedColor, selectedSize, product]);

  const hasVariantProperties = !!(product?.hasSize || product?.hasColor || product?.hasDimensions || product?.hasWeight);
  const activeProductVariants = product?.variants?.filter(v => v.active && (!v.isDefault || hasVariantProperties)) ?? [];
  const defaultVariant = product?.variants?.find(v => v.active && v.isDefault);
  const selectedVariant = activeProductVariants.find(v =>
    (!product?.hasSize || v.size === selectedSize) &&
    (!product?.hasColor || v.color === selectedColor) &&
    (!product?.hasDimensions || dimensionLabel(v) === selectedDimensions) &&
    (!product?.hasWeight || weightLabel(v) === selectedWeight)
  ) ?? (hasVariantProperties ? defaultVariant : undefined);

  return {
    selectedColor, setSelectedColor, selectedSize, setSelectedSize,
    selectedDimensions, setSelectedDimensions, selectedWeight, setSelectedWeight,
    activeProductVariants, selectedVariant,
  };
}
