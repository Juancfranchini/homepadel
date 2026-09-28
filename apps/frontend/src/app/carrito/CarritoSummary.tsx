'use client';

import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import CouponField from '@/components/cart/CouponField';
import type { CouponState } from '@/hooks/useCoupon';

interface Props {
  coupon: CouponState;
  subtotal: number;
  shippingCost: number;
  freeShippingThreshold: number;
  total: number;
  onCheckout: () => void;
}

export default function CarritoSummary({
  coupon, subtotal, shippingCost, freeShippingThreshold, total, onCheckout,
}: Props) {
  const { discount } = coupon;
  return (
    <div className="lg:col-span-1">
      <div className="bg-card rounded-2xl border border-[#B7D31A]/20 p-6 sticky top-24">
        <h2 className="font-black text-base uppercase tracking-tight text-fg mb-4">Resumen</h2>

        <CouponField coupon={coupon} />

        <div className="border-t border-line pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-fg-soft"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-500 light:text-green-700"><span>Descuento</span><span>-{formatPrice(discount)}</span></div>}
          <div className="flex justify-between text-fg-soft">
            <span>Correo Argentino (estimado)</span>
            <span className={shippingCost === 0 ? 'text-green-500 light:text-green-700 font-semibold' : ''}>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-black text-base pt-2 border-t border-line text-fg"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>

        <button type="button" onClick={onCheckout} className="mt-5 w-full flex items-center justify-center gap-2 bg-[#B7D31A] text-[#050606] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors">
          Finalizar compra <ArrowRight size={15} />
        </button>

        <p className="text-fg-muted text-xs text-center mt-3">Correo Argentino gratis en compras superiores a {formatPrice(freeShippingThreshold)}. Andreani y OCA se coordinan por WhatsApp.</p>
      </div>
    </div>
  );
}
