'use client';

import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  showInstallments: boolean;
  installments: number;
  cuota: number;
  interestLabel: string;
  interestPercent: number;
}

export default function RegularPricing({ showInstallments, installments, cuota, interestLabel, interestPercent }: Props) {
  return (
    <>
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
          <span>Pagá de forma segura dentro de Mercado Pago</span>
        </div>
      )}
    </>
  );
}
