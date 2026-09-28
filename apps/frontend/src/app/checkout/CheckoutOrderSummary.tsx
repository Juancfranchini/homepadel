'use client';

import Link from 'next/link';
import { ChevronRight, Lock, MessageCircle } from 'lucide-react';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getItemKey } from '@/store/cartStore';
import CouponField from '@/components/cart/CouponField';
import BolsaRegaloOption from '@/components/cart/BolsaRegaloOption';
import type { CouponState } from '@/hooks/useCoupon';
import CheckoutSummaryItem from './CheckoutSummaryItem';

interface Props {
  items: CartItem[];
  subtotal: number;
  coupon: CouponState;
  shippingCost: number;
  total: number;
  orderError: string;
  isSubmitting: boolean;
  paymentMethod: 'mercadopago' | 'transfer';
  shippingToCoordinate: boolean;
  /** Envío que depende de un dato que falta (la localidad para Flex). */
  shippingPending?: boolean;
  onQuantityChange: (itemKey: string, quantity: number) => void;
  onRemove: (itemKey: string) => void;
}

export default function CheckoutOrderSummary({
  items, subtotal, coupon, shippingCost, total, orderError, isSubmitting,
  paymentMethod, shippingToCoordinate, shippingPending = false, onQuantityChange, onRemove,
}: Props) {
  const vacio = items.length === 0;
  const { discount, couponCode } = coupon;

  return (
    <div className="lg:col-span-1">
      <div className="bg-card rounded-2xl border border-[#B7D31A]/20 p-6 sticky top-24">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-black text-base uppercase tracking-tight text-fg">Tu pedido</h2>
          <Link href="/catalogo" className="text-xs text-brand-fg hover:underline">Agregar más</Link>
        </div>

        {vacio ? (
          <p className="text-sm text-fg-muted mb-4">
            Tu pedido quedó vacío. <Link href="/catalogo" className="text-brand-fg hover:underline">Elegí algún producto</Link> para
            seguir — los datos que ya cargaste se mantienen.
          </p>
        ) : (
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {items.map((item) => {
              const clave = getItemKey(item);
              return (
                <CheckoutSummaryItem
                  key={clave}
                  item={item}
                  onQuantityChange={(cantidad) => onQuantityChange(clave, cantidad)}
                  onRemove={() => onRemove(clave)}
                />
              );
            })}
          </div>
        )}

        {!vacio && <BolsaRegaloOption compacta />}
        {!vacio && <CouponField coupon={coupon} />}

        <div className="border-t border-line pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-fg-soft"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-500 light:text-green-700"><span>Descuento{couponCode ? ' (' + couponCode + ')' : ''}</span><span>-{formatPrice(discount)}</span></div>}
          <div className="flex justify-between text-fg-soft"><span>Envío</span><span className={shippingToCoordinate || shippingPending ? 'text-amber-300 light:text-amber-700 font-semibold' : shippingCost === 0 ? 'text-green-500 light:text-green-700 font-semibold' : ''}>{shippingToCoordinate ? 'A coordinar' : shippingPending ? 'Elegí tu localidad' : shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span></div>
          <div className="flex justify-between font-black text-base pt-2 border-t border-line text-fg"><span>{shippingToCoordinate || shippingPending ? 'Total sin envío' : 'Total'}</span><span>{formatPrice(total)}</span></div>
        </div>

        {orderError && <p className="text-red-500 light:text-red-600 text-xs text-center mt-3">{orderError}</p>}

        <button type="submit" disabled={isSubmitting || vacio}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-[#B7D31A] text-[#050606] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? 'Procesando...' : shippingToCoordinate ? <><MessageCircle size={15} /> Coordinar por WhatsApp <ChevronRight size={15} /></> : <><Lock size={15} /> {paymentMethod === 'transfer' ? 'Solicitar compra' : 'Ir a Mercado Pago'} <ChevronRight size={15} /></>}
        </button>
        <p className="text-fg-muted text-xs text-center mt-3">Tus datos estan protegidos con encriptacion SSL</p>
      </div>
    </div>
  );
}
