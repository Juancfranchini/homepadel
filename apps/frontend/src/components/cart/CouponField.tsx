'use client';

import type { KeyboardEvent } from 'react';
import { Tag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CouponState } from '@/hooks/useCoupon';

export default function CouponField({ coupon }: { coupon: CouponState }) {
  const { input, setInput, couponCode, discount, error, loading, apply, remove } = coupon;
  const aplicado = Boolean(couponCode) && discount > 0;

  // En el checkout el campo vive dentro del <form> de compra: Enter no debe enviarlo.
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    void apply();
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={aplicado}
            aria-label="Código de cupón"
            className="w-full pl-9 pr-3 py-2 bg-[#1A1F21] border border-[#0D0F0F] rounded-lg text-xs text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/50 disabled:opacity-60"
            placeholder="Escribí tu código de cupón"
          />
        </div>
        {aplicado ? (
          <button type="button" onClick={remove} className="px-4 py-2 border border-[#B7D31A]/30 text-[#F7F6F7] rounded-lg text-xs font-bold hover:border-[#B7D31A]/60 transition-colors">
            Quitar
          </button>
        ) : (
          <button type="button" onClick={() => void apply()} disabled={loading} className="px-4 py-2 bg-[#B7D31A] text-[#050606] rounded-lg text-xs font-bold hover:bg-[#c8e81f] transition-colors disabled:opacity-60">
            {loading ? 'Validando...' : 'Aplicar'}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {aplicado && <p className="text-green-500 text-xs mt-1">Cupón &quot;{couponCode}&quot; aplicado: -{formatPrice(discount)}</p>}
    </div>
  );
}
