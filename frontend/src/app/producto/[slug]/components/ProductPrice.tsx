'use client';

import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  displayPrice: number;
  transferPrice: number;
  hasDiscount: boolean;
  originalPrice: number;
  cuota: number;
  paymentMethods: string[];
  onShowPaymentModal: () => void;
}

export default function ProductPrice({
  displayPrice,
  transferPrice,
  hasDiscount,
  originalPrice,
  cuota,
  paymentMethods,
  onShowPaymentModal,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Precio principal */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl md:text-5xl font-bold text-[#F7F6F7]">
          {formatPrice(displayPrice)}
        </span>
        {hasDiscount && (
          <span className="text-xl text-[#8A8A85] line-through font-medium">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>

      {/* Precio transferencia - DESTACADO */}
      <div className="bg-[#B7D31A]/10 border border-[#B7D31A]/30 rounded-xl p-4">
        <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-wider mb-1">
          Precio por transferencia o deposito
        </p>
        <p className="text-3xl font-bold text-[#F7F6F7]">
          {formatPrice(transferPrice)}
        </p>
        <p className="text-[#C7C7C0] text-xs mt-1">
          20% de descuento sobre el precio de lista
        </p>
      </div>

      {/* Cuotas */}
      <div className="flex items-center gap-1.5 text-[#C7C7C0] text-sm">
        <span className="text-[#F7F6F7] font-semibold">9 cuotas sin interes</span>
        <span>de {formatPrice(cuota)}</span>
      </div>

      {/* Ver medios de pago */}
      {paymentMethods.length > 0 && (
        <button
          onClick={onShowPaymentModal}
          className="flex items-center gap-1.5 text-[#C7C7C0] hover:text-[#F7F6F7] text-xs underline underline-offset-2 transition-colors w-fit"
        >
          <CreditCard size={12} />
          Ver mas detalles
        </button>
      )}
    </div>
  );
}