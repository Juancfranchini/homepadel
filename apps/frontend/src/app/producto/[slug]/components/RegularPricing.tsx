'use client';

import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  displayPrice: number;
  transferPrice: number;
  showInstallments: boolean;
  installments: number;
  cuota: number;
  interestLabel: string;
  interestPercent: number;
}

export default function RegularPricing({ displayPrice, transferPrice, showInstallments, installments, cuota, interestLabel, interestPercent }: Props) {
  return (
    <>
      {transferPrice > 0 && (
        <div className="bg-[#B7D31A]/10 border border-[#B7D31A]/30 rounded-xl p-4">
          <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-wider mb-1">
            Precio por transferencia o deposito
          </p>
          <p className="text-3xl font-bold text-[#F7F6F7]">
            {formatPrice(transferPrice)}
          </p>
          {transferPrice < displayPrice && (
            <p className="text-[#C7C7C0] text-xs mt-1">
              Ahorra {formatPrice(displayPrice - transferPrice)}
            </p>
          )}
        </div>
      )}

      {showInstallments ? (
        <div className="flex items-center gap-1.5 text-[#C7C7C0] text-sm">
          <span className="text-[#F7F6F7] font-semibold">
            {installments} cuotas {interestLabel}
          </span>
          <span>de {formatPrice(cuota)}</span>
          {interestPercent > 0 && (
            <span className="text-xs text-[#8A8A85]">(interes del {interestPercent}%)</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[#C7C7C0] text-sm">
          <CreditCard size={14} className="text-[#8A8A85]" />
          <span>Pago unico con tarjeta</span>
        </div>
      )}
    </>
  );
}
