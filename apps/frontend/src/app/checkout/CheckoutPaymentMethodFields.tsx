'use client';

import { CreditCard } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { getImageUrl } from '@/lib/utils';

const PAYMENT_OPTIONS = [
  { value: 'card', label: 'Tarjeta de credito / debito', desc: 'Visa, Mastercard, American Express', badge: ['VISA', 'MC', 'AMEX'] },
  { value: 'mercadopago', label: 'Mercado Pago', desc: 'Paga con tu cuenta o en efectivo', badge: ['MP'] },
  { value: 'transfer', label: 'Transferencia bancaria', desc: 'Te enviamos los datos por email', badge: [] },
];

interface Props {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  selectedPayment: string;
  visa: any;
  mastercard: any;
  amex: any;
  mercadopago: any;
}

function PaymentBadges({ pm, visa, mastercard, amex, mercadopago }: { pm: typeof PAYMENT_OPTIONS[0] } & Pick<Props, 'visa' | 'mastercard' | 'amex' | 'mercadopago'>) {
  if (pm.badge.length === 0) return null;
  if (pm.value === 'card') {
    return (
      <div className="flex gap-1">
        {visa?.active !== false && visa?.logo && <img src={getImageUrl(visa.logo)} alt="VISA" className="w-10 h-7 object-cover rounded" />}
        {mastercard?.active !== false && mastercard?.logo && <img src={getImageUrl(mastercard.logo)} alt="MC" className="w-10 h-7 object-cover rounded" />}
        {amex?.active !== false && amex?.logo && <img src={getImageUrl(amex.logo)} alt="AMEX" className="w-10 h-7 object-cover rounded" />}
      </div>
    );
  }
  if (pm.value === 'mercadopago') {
    return <div className="flex gap-1">{mercadopago?.logo && <img src={getImageUrl(mercadopago.logo)} alt="MP" className="w-10 h-7 object-cover rounded" />}</div>;
  }
  return null;
}

export default function CheckoutPaymentMethodFields({ register, errors, selectedPayment, visa, mastercard, amex, mercadopago }: Props) {
  return (
    <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">3</div>
        <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><CreditCard size={16} /> Metodo de pago</h2>
      </div>
      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((pm) => (
          <label key={pm.value} className={'flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ' + (selectedPayment === pm.value ? 'border-[#B7D31A] bg-[#B7D31A]/5 shadow-[0_0_12px_rgba(183,211,26,0.08)]' : 'border-[#1A1F21] hover:border-[#B7D31A]/30 hover:shadow-[0_0_8px_rgba(183,211,26,0.04)]')}>
            <input {...register('paymentMethod')} type="radio" value={pm.value} className="sr-only" />
            <div className={'w-5 h-5 rounded-full border-2 flex items-center justify-center ' + (selectedPayment === pm.value ? 'border-[#B7D31A]' : 'border-[#1A1F21]')}>
              {selectedPayment === pm.value && <div className="w-2.5 h-2.5 rounded-full bg-[#B7D31A]" />}
            </div>
            <div className="flex-1"><p className="font-bold text-sm text-[#F7F6F7]">{pm.label}</p><p className="text-xs text-[#8A8A85]">{pm.desc}</p></div>
            <PaymentBadges pm={pm} visa={visa} mastercard={mastercard} amex={amex} mercadopago={mercadopago} />
          </label>
        ))}
      </div>
      {errors.paymentMethod && <p className="text-red-500 text-xs mt-2">{String(errors.paymentMethod.message)}</p>}
    </div>
  );
}
