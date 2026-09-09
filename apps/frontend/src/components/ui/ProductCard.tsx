'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { getDiscountPercent } from '@/lib/utils';
import ProductCardImage from './ProductCardImage';
import ProductCardContent from './ProductCardContent';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const isMadeToOrder = product.isMadeToOrder === true;
  const hasDiscount = !isMadeToOrder && product.effectivePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.effectivePrice) : 0;

  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div className="bg-[#0C0C0C] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#B7D31A]/10 border border-[#B7D31A]/20 hover:border-[#B7D31A]/60 flex flex-col">

      <ProductCardImage
        product={product}
        initials={initials}
        hasDiscount={hasDiscount}
        discountPct={discountPct}
        isMadeToOrder={isMadeToOrder}
        wished={wished}
        onToggleWish={(e) => { e.preventDefault(); setWished(!wished); }}
      />

      <ProductCardContent
        product={product}
        isMadeToOrder={isMadeToOrder}
        hasDiscount={hasDiscount}
        adding={adding}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}