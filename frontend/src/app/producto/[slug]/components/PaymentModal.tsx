'use client';

import { X, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface PaymentDef { label: string; group: string; color: string }

const PAYMENT_CATALOG: Record<string, PaymentDef> = {
  visa: { label: 'Visa', group: 'credit', color: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  mastercard: { label: 'Mastercard', group: 'credit', color: 'bg-orange-900/40 text-orange-300 border-orange-700/40' },
  amex: { label: 'Amex', group: 'credit', color: 'bg-blue-900/40 text-blue-200 border-blue-700/40' },
  transferencia:{ label: 'Transferencia', group: 'transfer', color: 'bg-[#B7D31A]/10 text-[#B7D31A] border-[#B7D31A]/30' },
  mercadopago: { label: 'Mercado Pago', group: 'wallet', color: 'bg-sky-900/40 text-sky-300 border-sky-700/40' },
};

interface Props {
  onClose: () => void;
  methods: string[];
  displayPrice: number;
  transferPrice: number;
}

export default function PaymentModal({ onClose, methods, displayPrice, transferPrice }: Props) {
  const { mercadopago, transferencia, visa } = usePaymentMethods();
  const hasTransfer = methods.some((m) => ['transferencia', 'banelco', 'link'].includes(m));
  const creditMethods = methods.filter((m) => PAYMENT_CATALOG[m]?.group === 'credit');
  const cuota3 = Math.ceil(displayPrice / 3);
  const cuota6 = Math.ceil(displayPrice / 6);
  const cuota9 = Math.ceil(displayPrice / 9);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg bg-[#0C0C0C] border border-[#0D0F0F] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0C0C0C] border-b border-[#0D0F0F] px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#B7D31A]" />
            <h2 className="text-[#F7F6F7] font-semibold text-base uppercase tracking-wide">Medios de pago</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[#8A8A85] hover:text-[#F7F6F7] hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {creditMethods.length > 0 && (
            <div className="bg-[#050606] border border-[#0D0F0F] rounded-xl p-4">
              <p className="text-xs text-[#C7C7C0] font-semibold uppercase tracking-wide mb-3">
                Total en 1 pago: <span className="text-[#F7F6F7]">{formatPrice(displayPrice)}</span>
              </p>
              <p className="text-xs text-[#C7C7C0] mb-2">O paga en cuotas sin interes:</p>
              <div className="space-y-2">
                {[{ n: 3, monto: cuota3 }, { n: 6, monto: cuota6 }, { n: 9, monto: cuota9 }].map(({ n, monto }) => (
                  <div key={n} className="flex items-center justify-between text-sm py-1.5 border-b border-[#0D0F0F] last:border-0">
                    <span className="text-[#F7F6F7] font-semibold">{n} cuotas de {formatPrice(monto)} sin interes</span>
                    <span className="text-[#8A8A85] text-xs">Total {formatPrice(displayPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasTransfer && (
            <div className="bg-[#B7D31A]/[0.06] border border-[#B7D31A]/20 rounded-xl p-4">
              <p className="text-[#B7D31A] font-semibold text-sm mb-1">20% de descuento por transferencia</p>
              <p className="text-2xl font-bold text-[#F7F6F7]">{formatPrice(transferPrice)}</p>
              <p className="text-[#C7C7C0] text-xs mt-1">El descuento se aplica al confirmar el pago</p>
            </div>
          )}

          {['credit', 'transfer', 'wallet'].map((group) => {
            const groupMethods = methods.filter((m) => PAYMENT_CATALOG[m]?.group === group);
            if (groupMethods.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8A85] mb-3">
                  {group === 'credit' ? 'visas de credito' : group === 'transfer' ? 'Transferencia' : 'Billetera virtual'}
                </p>
                <div className="bg-[#050606] border border-[#0D0F0F] rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {groupMethods.map((key) => (
                      <span key={key} className={'px-3 py-1.5 rounded-lg text-xs font-semibold border ' + (PAYMENT_CATALOG[key]?.color ?? 'bg-white/10 text-white border-white/20')}>
                        {PAYMENT_CATALOG[key]?.label ?? key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}