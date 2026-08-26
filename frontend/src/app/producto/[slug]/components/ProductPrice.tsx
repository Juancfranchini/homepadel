'use client';

import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  displayPrice: number;
  transferPrice: number;
  hasDiscount: boolean;
  originalPrice: number;
  cuota: number;
  installments: number;
  hasInstallmentsInterest: boolean;
  installmentsInterest: number;
  paymentMethods: string[];
  onShowPaymentModal: () => void;
  isMadeToOrder?: boolean;
  estimatedDays?: number;
  requiredDeposit?: number;
}

export default function ProductPrice({
  displayPrice,
  transferPrice,
  hasDiscount,
  originalPrice,
  cuota,
  installments,
  hasInstallmentsInterest,
  installmentsInterest,
  paymentMethods,
  onShowPaymentModal,
  isMadeToOrder = false,
  estimatedDays,
  requiredDeposit = 0,
}: Props) {
  const showInstallments = !isMadeToOrder && installments > 0 && cuota > 0;
  const interestLabel = hasInstallmentsInterest ? 'con interes' : 'sin interes';
  const interestPercent = hasInstallmentsInterest && installmentsInterest ? installmentsInterest : 0;
  const depositAmount = isMadeToOrder && requiredDeposit > 0 ? Math.round(displayPrice * (requiredDeposit / 100)) : 0;
  const remainingAmount = depositAmount > 0 ? displayPrice - depositAmount : 0;

  return (
    <div className="space-y-3">
      {/* Precio principal */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl md:text-5xl font-bold text-[#F7F6F7]">
          {formatPrice(displayPrice)}
        </span>
        {hasDiscount && !isMadeToOrder && (
          <span className="text-xl text-[#8A8A85] line-through font-medium">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>

      {/* Producto por encargo */}
      {isMadeToOrder ? (
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
      ) : (
        <>
          {/* Precio transferencia */}
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

          {/* Cuotas o pago unico */}
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
      )}

      {/* Ver medios de pago */}
      {paymentMethods.length > 0 && !isMadeToOrder && (
        <button
          onClick={onShowPaymentModal}
          className="flex items-center gap-1.5 text-[#C7C7C0] hover:text-[#F7F6F7] text-xs underline underline-offset-2 transition-colors w-fit"
        >
          <CreditCard size={12} />
          Ver más detalles
        </button>
      )}
    </div>
  );
}