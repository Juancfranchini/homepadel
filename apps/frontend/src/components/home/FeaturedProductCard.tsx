'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import FeaturedProductCardImage from './FeaturedProductCardImage';

export default function FeaturedProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0 || adding) return;
    if (product.variants?.some((variant) => variant.active && !variant.isDefault) || product.hasSize || product.hasColor || product.hasDimensions || product.hasWeight) {
      router.push('/producto/' + product.slug);
      return;
    }
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 900);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWished(!wished);
  };

  return (
    <Link
      href={'/producto/' + product.slug}
      className="group bg-[#0C0C0C] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#B7D31A]/10 border border-[#B7D31A]/20 hover:border-[#B7D31A]/60 flex flex-col"
    >
      <FeaturedProductCardImage product={product} hasDiscount={hasDiscount} discountPct={discountPct} wished={wished} onWish={handleWish} />

      <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-1.5 sm:gap-2 flex-1">
        {product.brand && (
          <p className="text-xs text-[#8A8A85] font-semibold uppercase tracking-wider">{product.brand.name}</p>
        )}

        <h3 className="font-semibold text-sm text-[#F7F6F7] leading-snug line-clamp-2 uppercase">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-1">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold text-[#F7F6F7]">{formatPrice(product.salePrice!)}</span>
              <span className="text-xs text-[#8A8A85] line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-xl font-bold text-[#F7F6F7]">{formatPrice(product.price)}</span>
          )}
        </div>

        {product.price >= 10000 && (
          <p className="text-xs text-[#C7C7C0] font-medium">
            Hasta 9 cuotas sin interes
          </p>
        )}

        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || adding}
          className={'mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all duration-200 ' +
            (product.stock === 0
              ? 'bg-white/5 text-[#8A8A85] cursor-not-allowed'
              : adding
              ? 'bg-[#B7D31A] text-[#050606] scale-95'
              : 'bg-[#B7D31A] text-[#050606] hover:bg-[#CAE52E] btn-primary-glow')}
        >
          <ShoppingCart size={14} />
          {product.stock === 0 ? 'Sin stock' : adding ? 'AGREGADO' : 'COMPRAR'}
        </button>
      </div>
    </Link>
  );
}
