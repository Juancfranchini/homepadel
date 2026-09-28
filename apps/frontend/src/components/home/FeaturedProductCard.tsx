'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Truck } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useFavorito } from '@/store/favoritosStore';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import FeaturedProductCardImage from './FeaturedProductCardImage';
import { useShippingRates } from '@/hooks/useShippingRates';
import { formatDiscountPercent, getInstallmentTerms } from '@/lib/productPricing';

export default function FeaturedProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const favorito = useFavorito(product.id);
  const [adding, setAdding] = useState(false);
  const { freeShippingThreshold, isLoaded } = useShippingRates();

  const isMadeToOrder = product.isMadeToOrder === true;
  const hasDiscount = !isMadeToOrder && product.effectivePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.effectivePrice) : 0;
  const displayPrice = isMadeToOrder ? product.price : product.effectivePrice;
  const installments = isMadeToOrder ? null : getInstallmentTerms(product);
  const freeShipping = isLoaded && !isMadeToOrder && displayPrice >= freeShippingThreshold;

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
    favorito.alternar();
  };

  return (
    <Link
      href={'/producto/' + product.slug}
      className="group bg-panel rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#B7D31A]/10 border border-[#B7D31A]/20 hover:border-[#B7D31A]/60 flex flex-col"
    >
      <FeaturedProductCardImage product={product} hasDiscount={hasDiscount} discountPct={discountPct} wished={favorito.marcado} onWish={handleWish} />

      <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-1.5 sm:gap-2 flex-1">
        {product.brand && (
          <p className="text-xs text-fg-muted font-semibold uppercase tracking-wider">{product.brand.name}</p>
        )}

        <h3 className="font-semibold text-sm text-fg leading-snug line-clamp-2 uppercase">
          {product.name}
        </h3>

        {hasDiscount && <p className="text-xs text-fg-muted line-through mt-1 leading-none">{formatPrice(product.price)}</p>}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-black text-fg tracking-tight">{formatPrice(displayPrice)}</span>
          {hasDiscount && <span className="text-xs font-bold text-brand-fg">{formatDiscountPercent(discountPct)}% OFF</span>}
        </div>

        {installments && <p className="text-xs text-brand-fg font-medium">{installments.count} cuotas de {formatPrice(installments.amount)} {installments.interestText}</p>}
        {freeShipping && <p className="flex items-center gap-1 text-xs font-bold text-brand-fg"><Truck size={12} />Envío gratis</p>}

        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || adding}
          className={'mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all duration-200 ' +
            (product.stock === 0
              ? 'bg-fg/5 text-fg-muted cursor-not-allowed'
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
