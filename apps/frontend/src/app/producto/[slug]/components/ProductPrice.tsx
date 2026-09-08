'use client';

import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import MadeToOrderPricing from './MadeToOrderPricing';
import RegularPricing from './RegularPricing';

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
        <MadeToOrderPricing
          estimatedDays={estimatedDays}
          depositAmount={depositAmount}
          remainingAmount={remainingAmount}
          requiredDeposit={requiredDeposit}
        />
      ) : (
        <RegularPricing
          displayPrice={displayPrice}
          transferPrice={transferPrice}
          showInstallments={showInstallments}
          installments={installments}
          cuota={cuota}
          interestLabel={interestLabel}
          interestPercent={interestPercent}
        />
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