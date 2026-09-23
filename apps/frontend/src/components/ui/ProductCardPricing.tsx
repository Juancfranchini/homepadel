'use client';

import { Truck } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useShippingRates } from '@/hooks/useShippingRates';

interface Props {
  product: Product;
  isMadeToOrder: boolean;
  hasDiscount: boolean;
}

/**
 * Bloque comercial de la tarjeta: precio, cuotas y precio por transferencia.
 *
 * Se separó del resto de la tarjeta porque concentra las tres cifras que el
 * comprador compara, y conviene que la regla de cuál se muestra esté en un
 * único lugar y no repartida entre la tarjeta y la ficha.
 */
export default function ProductCardPricing({ product, isMadeToOrder, hasDiscount }: Props) {
  const { freeShippingThreshold, isLoaded } = useShippingRates();

  const cuotas = product.installments || 6;
  const valorCuota = Math.ceil(product.effectivePrice / cuotas);

  // Solo se anuncia como beneficio si realmente es más barato que pagar normal.
  const transferencia =
    product.transferPrice && product.transferPrice > 0 && product.transferPrice < product.effectivePrice
      ? product.transferPrice
      : null;

  // El umbral se administra desde el backoffice y el servidor recalcula el costo
  // al cobrar. Se espera a tener el valor real antes de prometer el beneficio:
  // anunciarlo con el valor por defecto y después cobrarlo sería peor que no decirlo.
  const envioGratis = isLoaded && product.effectivePrice >= freeShippingThreshold;

  return (
    <>
      <div className="flex items-end gap-2 mt-auto pt-1">
        {hasDiscount && !isMadeToOrder ? (
          <>
            <span className="text-lg font-black text-white">{formatPrice(product.effectivePrice)}</span>
            <span className="text-sm text-[#A1A1AA] line-through">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
        )}
      </div>

      {!isMadeToOrder && (
        <p className="text-[10px] font-semibold text-[#B7D31A]">
          {cuotas} x {formatPrice(valorCuota)} sin interés
        </p>
      )}

      {!isMadeToOrder && transferencia && (
        <p className="text-[11px] font-bold text-[#F7F6F7]">
          {formatPrice(transferencia)}{' '}
          <span className="font-semibold text-[#8A8A85]">por transferencia</span>
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
