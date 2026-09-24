'use client';

import { CreditCard, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { formatDiscountPercent } from '@/lib/productPricing';
import { useShippingRates } from '@/hooks/useShippingRates';
import MadeToOrderPricing from './MadeToOrderPricing';
import RegularPricing from './RegularPricing';

interface Props {
  productName: string;
  displayPrice: number;
  hasDiscount: boolean;
  discountPct: number;
  originalPrice: number;
  cuota: number;
  installments: number;
  hasInstallmentsInterest: boolean;
  installmentsInterest: number;
  onShowPaymentModal: () => void;
  isMadeToOrder?: boolean;
  estimatedDays?: number;
  requiredDeposit?: number;
}

export default function ProductPrice({
  productName, displayPrice,
  hasDiscount,
  discountPct,
  originalPrice,
  cuota,
  installments,
  hasInstallmentsInterest,
  installmentsInterest,
  onShowPaymentModal,
  isMadeToOrder = false,
  estimatedDays,
  requiredDeposit = 0,
}: Props) {
  const { freeShippingThreshold, isLoaded: shippingLoaded } = useShippingRates();
  const showInstallments = !isMadeToOrder && installments > 0 && cuota > 0;
  const interestLabel = hasInstallmentsInterest ? 'con interés' : 'sin interés';
  const interestPercent = hasInstallmentsInterest && installmentsInterest ? installmentsInterest : 0;
  const depositAmount = isMadeToOrder && requiredDeposit > 0 ? Math.round(displayPrice * (requiredDeposit / 100)) : 0;
  const remainingAmount = depositAmount > 0 ? displayPrice - depositAmount : 0;
  const hasFreeShipping = shippingLoaded && !isMadeToOrder && displayPrice >= freeShippingThreshold;

  return (
    <div className="space-y-3">
      {/* Precio principal */}
      {hasDiscount && !isMadeToOrder && <p className="text-base text-[#8A8A85] line-through">{formatPrice(originalPrice)}</p>}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl md:text-5xl font-black text-[#F7F6F7] tracking-tight">
          {formatPrice(displayPrice)}
        </span>
        {hasDiscount && !isMadeToOrder && (
          <span className="text-sm md:text-base text-[#B7D31A] font-bold">{formatDiscountPercent(discountPct)}% OFF</span>
        )}
      </div>

      {/* Producto por encargo */}
      {isMadeToOrder ? (
        <MadeToOrderPricing
          productName={productName}
          estimatedDays={estimatedDays}
          depositAmount={depositAmount}
          remainingAmount={remainingAmount}
          requiredDeposit={requiredDeposit}
        />
      ) : (
        <RegularPricing
          showInstallments={showInstallments}
          installments={installments}
          cuota={cuota}
          interestLabel={interestLabel}
          interestPercent={interestPercent}
        />
      )}

      {hasFreeShipping && <p className="flex items-center gap-1.5 text-sm font-bold text-[#B7D31A]"><Truck size={16} />Envío gratis con Correo Argentino</p>}

      {/* Ver medios de pago */}
      {!isMadeToOrder && (
        <button
          onClick={onShowPaymentModal}
          className="flex items-center gap-1.5 text-[#C7C7C0] hover:text-[#F7F6F7] text-xs underline underline-offset-2 transition-colors w-fit"
        >
          <CreditCard size={12} />
          Ver medios de pago
        </button>
      )}
    </div>
  );
}
