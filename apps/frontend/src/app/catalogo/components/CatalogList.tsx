'use client';

import Link from 'next/link';
import { Truck } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent, getImageUrl } from '@/lib/utils';
import { formatDiscountPercent, getInstallmentTerms } from '@/lib/productPricing';
import { useShippingRates } from '@/hooks/useShippingRates';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function CatalogList({ products, onAddToCart }: Props) {
  const { freeShippingThreshold, isLoaded } = useShippingRates();

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const isMadeToOrder = product.isMadeToOrder === true;
        const hasDiscount = !isMadeToOrder && product.effectivePrice < product.price;
        const discountPct = hasDiscount ? getDiscountPercent(product.price, product.effectivePrice) : 0;
        const displayPrice = isMadeToOrder ? product.price : product.effectivePrice;
        const installments = isMadeToOrder ? null : getInstallmentTerms(product);
        const freeShipping = isLoaded && !isMadeToOrder && displayPrice >= freeShippingThreshold;
        const imageUrl = product.images?.length > 0 ? getImageUrl(product.images[0]) : null;

        return (
          <div key={product.id} className="bg-[#0C0C0C] rounded-2xl border border-[#B7D31A]/20 hover:border-[#B7D31A]/60 hover:shadow-2xl hover:shadow-[#B7D31A]/10 transition-all duration-300 overflow-hidden">
            <div className="flex gap-4 p-4">
              {/* Imagen */}
              <Link href={'/producto/' + product.slug} className="w-24 h-24 flex-shrink-0 bg-[#050606] rounded-xl overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8A8A85] text-lg font-bold">
                    {product.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#8A8A85] font-semibold uppercase tracking-wider">{product.brand?.name}</p>
                <Link href={'/producto/' + product.slug} className="text-[#F7F6F7] font-semibold text-sm hover:text-[#B7D31A] transition-colors line-clamp-2">
                  {product.name}
                </Link>
                {hasDiscount && <p className="text-[11px] text-[#8A8A85] line-through mt-1">{formatPrice(product.price)}</p>}
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#F7F6F7]">{formatPrice(displayPrice)}</span>
                  {hasDiscount && <span className="text-xs font-bold text-[#B7D31A]">{formatDiscountPercent(discountPct)}% OFF</span>}
                </div>
                {installments && <p className="text-xs text-[#B7D31A] mt-0.5">{installments.count} cuotas de {formatPrice(installments.amount)} {installments.interestText}</p>}
                {freeShipping && <p className="flex items-center gap-1 text-xs font-bold text-[#B7D31A] mt-1"><Truck size={12} />Envío gratis</p>}
              </div>

              {/* Boton */}
              <div className="flex items-center">
                <button
                  onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
                  disabled={product.stock === 0}
                  className="px-6 py-2.5 bg-[#B7D31A] text-[#050606] rounded-lg font-semibold text-xs uppercase tracking-wider btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {product.stock === 0 ? 'Sin stock' : 'AGREGAR'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
