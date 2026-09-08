'use client';

import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  couponInput: string;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => void;
  couponLoading: boolean;
  couponError: string;
  couponCode: string | null;
  discount: number;
  subtotal: number;
  shippingCost: number;
  freeShippingThreshold: number;
  total: number;
}

export default function CarritoSummary({
  couponInput, onCouponInputChange, onApplyCoupon, couponLoading, couponError,
  couponCode, discount, subtotal, shippingCost, freeShippingThreshold, total,
}: Props) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6 sticky top-24">
        <h2 className="font-black text-base uppercase tracking-tight text-[#F7F6F7] mb-4">Resumen</h2>

        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" />
              <input type="text" value={couponInput} onChange={(e) => onCouponInputChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1A1F21] border border-[#0D0F0F] rounded-lg text-xs text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/50"
                placeholder="Código de cupon" />
            </div>
            <button onClick={onApplyCoupon} disabled={couponLoading} className="px-4 py-2 bg-[#B7D31A] text-[#050606] rounded-lg text-xs font-bold hover:bg-[#c8e81f] transition-colors disabled:opacity-60">
              {couponLoading ? 'Validando...' : 'Aplicar'}
            </button>
          </div>
          {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
          {couponCode && discount > 0 && <p className="text-green-500 text-xs mt-1">Cupón &quot;{couponCode}&quot; aplicado: -{formatPrice(discount)}</p>}
        </div>

        <div className="border-t border-[#0D0F0F] pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-[#C7C7C0]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-500"><span>Descuento</span><span>-{formatPrice(discount)}</span></div>}
          <div className="flex justify-between text-[#C7C7C0]">
            <span>Envío</span>
            <span className={shippingCost === 0 ? 'text-green-500 font-semibold' : ''}>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-black text-base pt-2 border-t border-[#0D0F0F] text-[#F7F6F7]"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>

        <Link href="/checkout" className="mt-5 w-full flex items-center justify-center gap-2 bg-[#B7D31A] text-[#050606] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors">
          Finalizar compra <ArrowRight size={15} />
        </Link>

        <p className="text-[#8A8A85] text-xs text-center mt-3">Envío gratis en compras superiores a {formatPrice(freeShippingThreshold)}</p>
      </div>
    </div>
  );
}
