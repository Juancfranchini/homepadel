'use client';

import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { validateCoupon } from '@/lib/api';
import { subtotalConTransferencia } from '@/lib/productPricing';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface Props {
  items: CartItem[];
  couponCode: string | null;
  /** Total pagando con Mercado Pago, para mostrar cuánto se ahorra. */
  totalLista: number;
  flatRate: number;
  freeShippingThreshold: number;
}

/**
 * Total pagando por transferencia, con la misma cuenta que hace el checkout
 * (y el servidor): cada producto a su precio de transferencia, y cupón y envío
 * gratis calculados sobre ese subtotal. Solo aparece si la transferencia está
 * habilitada y el carrito tiene algo más barato pagando así.
 */
export default function CarritoTotalTransferencia({ items, couponCode, totalLista, flatRate, freeShippingThreshold }: Props) {
  const { transferencia, isLoaded } = usePaymentMethods();
  const subtotal = subtotalConTransferencia(items);
  const [descuento, setDescuento] = useState(0);

  useEffect(() => {
    if (!couponCode || subtotal <= 0) return setDescuento(0);
    let vigente = true;
    validateCoupon(couponCode, subtotal)
      .then((data) => vigente && setDescuento(data.discountAmount ?? 0))
      .catch(() => vigente && setDescuento(0));
    return () => { vigente = false; };
  }, [couponCode, subtotal]);

  const envio = subtotal >= freeShippingThreshold ? 0 : flatRate;
  const total = subtotal - descuento + envio;
  if (!isLoaded || !transferencia.active || total >= totalLista) return null;

  return (
    <div className="mt-3 rounded-xl border border-[#B7D31A]/30 bg-[#B7D31A]/5 px-4 py-3 text-sm">
      <p className="flex items-center justify-between gap-2 font-bold text-fg">
        <span className="flex items-center gap-1.5"><Landmark size={14} /> Pagando por transferencia</span>
        <span>{formatPrice(total)}</span>
      </p>
      <p className="mt-1 text-xs text-fg-soft">
        Ahorrás {formatPrice(totalLista - total)}. {envio > 0 ? 'Incluye envío por Correo Argentino (' + formatPrice(envio) + ').' : 'Envío por Correo Argentino gratis.'} Elegilo en el checkout.
      </p>
    </div>
  );
}
