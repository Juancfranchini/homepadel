'use client';

import { Truck } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useShippingRates } from '@/hooks/useShippingRates';
import { formatDiscountPercent, getInstallmentTerms } from '@/lib/productPricing';

interface Props {
  product: Product;
  isMadeToOrder: boolean;
  hasDiscount: boolean;
}

/**
 * Bloque comercial de la tarjeta: precio, cuotas y envío.
 *
 * Se separó del resto de la tarjeta porque concentra las tres cifras que el
 * comprador compara, y conviene que la regla de cuál se muestra esté en un
 * único lugar y no repartida entre la tarjeta y la ficha.
 */
export default function ProductCardPricing({ product, isMadeToOrder, hasDiscount }: Props) {
  const { freeShippingThreshold, isLoaded } = useShippingRates();

  const installments = getInstallmentTerms(product);
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.effectivePrice) : 0;

  // El umbral se administra desde el backoffice y el servidor recalcula el costo
  // al cobrar. Se espera a tener el valor real antes de prometer el beneficio:
  // anunciarlo con el valor por defecto y después cobrarlo sería peor que no decirlo.
  const envioGratis = isLoaded && !isMadeToOrder && product.effectivePrice >= freeShippingThreshold;

  return (
    <>
      <div className="mt-auto pt-1">
        {hasDiscount && !isMadeToOrder && <p className="text-xs text-[#8A8A85] line-through leading-none mb-1">{formatPrice(product.price)}</p>}
        <div className="flex flex-wrap items-baseline gap-2">
        {hasDiscount && !isMadeToOrder ? (
          <>
            <span className="text-2xl font-black text-white tracking-tight">{formatPrice(product.effectivePrice)}</span>
            <span className="text-xs font-bold text-[#B7D31A]">{formatDiscountPercent(discountPct)}% OFF</span>
          </>
        ) : (
          <span className="text-2xl font-black text-white tracking-tight">{formatPrice(product.price)}</span>
        )}
        </div>
      </div>

      {!isMadeToOrder && installments && (
        <p className="text-[10px] font-semibold text-[#B7D31A]">
          {installments.count} cuotas de {formatPrice(installments.amount)} {installments.interestText}
        </p>
      )}

      {envioGratis && (
        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#B7D31A]">
          <Truck size={11} />
          Envío gratis
        </p>
      )}
    </>
  );
}
