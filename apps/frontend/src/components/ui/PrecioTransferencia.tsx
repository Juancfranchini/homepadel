'use client';

import { Landmark } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getTransferPrice } from '@/lib/productPricing';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface Props {
  product: Pick<Product, 'effectivePrice' | 'transferPrice'>;
  /** `ficha`: bloque destacado de la página del producto. `tarjeta`: una línea en el catálogo. */
  variante?: 'tarjeta' | 'ficha';
}

/**
 * Precio pagando por transferencia. Solo aparece si el producto tiene uno
 * menor al vigente y la transferencia está habilitada: prometer un precio
 * que no se puede pagar sería peor que no mostrarlo. Es el que cobra el
 * servidor en un pedido por transferencia.
 */
export default function PrecioTransferencia({ product, variante = 'tarjeta' }: Props) {
  const { transferencia, isLoaded } = usePaymentMethods();
  const precio = getTransferPrice(product);
  if (!isLoaded || !transferencia.active || precio === null) return null;

  if (variante === 'ficha') {
    return (
      <div className="rounded-xl border border-[#B7D31A]/30 bg-[#B7D31A]/5 px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          <Landmark size={13} /> Precio por transferencia
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-black text-fg">{formatPrice(precio)}</span>
          <span className="text-sm font-bold text-brand-fg">Ahorrás {formatPrice(product.effectivePrice - precio)}</span>
        </p>
      </div>
    );
  }

  return (
    <p className="text-xs text-fg-soft">
      <span className="font-bold text-fg">{formatPrice(precio)}</span> con transferencia
    </p>
  );
}
