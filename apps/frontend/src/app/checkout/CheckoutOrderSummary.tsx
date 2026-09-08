'use client';

import { ChevronRight, Lock } from 'lucide-react';
import { CartItem } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Props {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingCost: number;
  total: number;
  orderError: string;
  isSubmitting: boolean;
}

export default function CheckoutOrderSummary({ items, subtotal, discount, couponCode, shippingCost, total, orderError, isSubmitting }: Props) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6 sticky top-24">
        <h2 className="font-black text-base uppercase tracking-tight text-[#F7F6F7] mb-4">Tu pedido</h2>
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {items.map(({ product, quantity }) => {
            const price = product.salePrice ?? product.price;
            return (
              <div key={product.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg bg-[#1A1F21] flex-none overflow-hidden">
                  {product.images[0] ? <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-black text-[#8A8A85]">{product.name.slice(0, 2).toUpperCase()}</div>}
                </div>
                <div className="flex-1 min-w-0"><p className="text-xs font-medium text-[#C7C7C0] truncate">{product.name}</p><p className="text-xs text-[#8A8A85]">x{quantity}</p></div>
                <p className="text-xs font-bold text-[#F7F6F7] flex-none">{formatPrice(price * quantity)}</p>
              </div>
            );
          })}
        </div>
        <div className="border-t border-[#0D0F0F] pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-[#C7C7C0]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-500"><span>Descuento{couponCode ? ' (' + couponCode + ')' : ''}</span><span>-{formatPrice(discount)}</span></div>}
          <div className="flex justify-between text-[#C7C7C0]"><span>Envío</span><span className={shippingCost === 0 ? 'text-green-500 font-semibold' : ''}>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span></div>
          <div className="flex justify-between font-black text-base pt-2 border-t border-[#0D0F0F] text-[#F7F6F7]"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>
        {orderError && <p className="text-red-500 text-xs text-center mt-3">{orderError}</p>}
        <button type="submit" disabled={isSubmitting}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-[#B7D31A] text-[#050606] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? 'Procesando...' : <><Lock size={15} /> Realizar pedido <ChevronRight size={15} /></>}
        </button>
        <p className="text-[#8A8A85] text-xs text-center mt-3">Tus datos estan protegidos con encriptacion SSL</p>
      </div>
    </div>
  );
}
