'use client';

import { formatPrice } from '@/lib/utils';

interface Props {
  estimatedDays?: number;
  depositAmount: number;
  remainingAmount: number;
  requiredDeposit: number;
}

export default function MadeToOrderPricing({ estimatedDays, depositAmount, remainingAmount, requiredDeposit }: Props) {
  return (
    <div className="bg-[#B7D31A]/10 border border-[#B7D31A]/30 rounded-xl p-4 space-y-2">
      <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-wider">
        Producto por encargo
      </p>
      {estimatedDays && (
        <p className="text-[#C7C7C0] text-sm">
          Tiempo estimado: <span className="font-semibold text-[#F7F6F7]">{estimatedDays} días</span>
        </p>
      )}
      {depositAmount > 0 ? (
        <>
          <p className="text-[#C7C7C0] text-sm">
            Pago adelantado ({requiredDeposit}%): <span className="font-semibold text-[#F7F6F7]">{formatPrice(depositAmount)}</span>
          </p>
          <p className="text-[#C7C7C0] text-sm">
            Resto al recibir: <span className="font-semibold text-[#F7F6F7]">{formatPrice(remainingAmount)}</span>
          </p>
        </>
      ) : (
        <p className="text-[#C7C7C0] text-sm">
          Pago total anticipado
        </p>
      )}
    </div>
  );
}
