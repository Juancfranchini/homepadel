'use client';

import { CreditCard, ExternalLink, ShieldCheck, Wallet, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  onClose: () => void;
  displayPrice: number;
  installments: number;
  hasInstallmentsInterest: boolean;
  installmentsInterest: number;
}

export default function PaymentModal({ onClose, displayPrice, installments, hasInstallmentsInterest, installmentsInterest }: Props) {
  const financedTotal = displayPrice * (1 + (hasInstallmentsInterest ? installmentsInterest / 100 : 0));
  const installmentAmount = installments > 0 ? Math.ceil(financedTotal / installments) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg bg-panel border border-line rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-panel border-b border-line px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-brand-fg" />
            <h2 className="text-fg font-semibold text-base uppercase tracking-wide">Mercado Pago</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="w-8 h-8 rounded-full bg-fg/[0.06] flex items-center justify-center text-fg-muted hover:text-fg hover:bg-fg/10">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-page border border-[#B7D31A]/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-fg">Checkout Pro es el único medio de pago de Home Pádel.</p>
            <p className="text-xs text-fg-soft mt-1">Al comprar, te redirigimos a Mercado Pago. Ahí elegís tarjeta, saldo u otro medio disponible para tu cuenta.</p>
          </div>

          {installments > 0 && (
            <div className="flex items-start gap-3 bg-page border border-line rounded-xl p-4">
              <CreditCard size={18} className="text-brand-fg mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-fg">
                  {installments} cuotas de {formatPrice(installmentAmount)} {hasInstallmentsInterest ? 'con interés' : 'sin interés'}
                </p>
                <p className="text-xs text-fg-muted mt-1">La disponibilidad final de cuotas y tarjetas se confirma en Mercado Pago.</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 bg-page border border-line rounded-xl p-4">
            <ShieldCheck size={18} className="text-brand-fg mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-fg">Tus datos de pago no pasan por nuestra plataforma</p>
              <p className="text-xs text-fg-muted mt-1">Home Pádel no solicita ni almacena números de tarjeta o códigos de seguridad.</p>
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-fg-muted"><ExternalLink size={13} />Total del producto: {formatPrice(displayPrice)}</p>
        </div>
      </div>
    </div>
  );
}
