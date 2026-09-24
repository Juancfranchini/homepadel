'use client';

import { CheckCircle2, CreditCard, ExternalLink, Landmark, ShieldCheck } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { CheckoutFormData } from './checkoutSchema';
import { PaymentMethodConfig } from '@/hooks/usePaymentMethods';

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  selectedPayment: CheckoutFormData['paymentMethod'];
  mercadopago: PaymentMethodConfig;
  transferencia: PaymentMethodConfig;
}

export default function CheckoutPaymentMethodFields({ register, errors, selectedPayment, mercadopago, transferencia }: Props) {
  const allowTransfer = transferencia.active === true;

  return (
    <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">3</div>
        <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><CreditCard size={16} /> Método de pago</h2>
      </div>
      {!allowTransfer && <input {...register('paymentMethod')} type="hidden" value="mercadopago" />}
      <label className={'flex items-center gap-3 border rounded-xl p-4 ' + (selectedPayment === 'mercadopago' ? 'border-[#B7D31A] bg-[#B7D31A]/5' : 'border-[#1A1F21]')}>
        {allowTransfer && <input {...register('paymentMethod')} type="radio" value="mercadopago" className="sr-only" />}
        {selectedPayment === 'mercadopago' ? <CheckCircle2 className="w-5 h-5 text-[#B7D31A] flex-shrink-0" /> : <span className="w-5 h-5 rounded-full border-2 border-[#1A1F21] flex-shrink-0" />}
        <div className="flex-1">
          <p className="font-bold text-sm text-[#F7F6F7]">Mercado Pago Checkout Pro</p>
          <p className="text-xs text-[#C7C7C0]">Pagá con tarjeta, saldo u otros medios dentro de Mercado Pago.</p>
        </div>
        {mercadopago.logo && <Image src={getImageUrl(mercadopago.logo)} alt="Mercado Pago" width={48} height={32} className="w-12 h-8 object-contain rounded" />}
      </label>
      {allowTransfer && (
        <label className={'flex items-center gap-3 border rounded-xl p-4 mt-3 cursor-pointer ' + (selectedPayment === 'transfer' ? 'border-[#B7D31A] bg-[#B7D31A]/5' : 'border-[#1A1F21]')}>
          <input {...register('paymentMethod')} type="radio" value="transfer" className="sr-only" />
          <Landmark className="w-5 h-5 text-[#B7D31A] flex-shrink-0" />
          <div><p className="font-bold text-sm text-[#F7F6F7]">Transferencia bancaria</p><p className="text-xs text-[#C7C7C0]">Te contactamos para que termines la compra.</p></div>
        </label>
      )}
      {selectedPayment === 'mercadopago' && (
        <div className="flex items-start gap-2 mt-3 text-xs text-[#8A8A85]">
          <ShieldCheck size={15} className="text-[#B7D31A] mt-0.5 flex-shrink-0" />
          <p>Al continuar, salís temporalmente de Home Pádel para completar el pago de forma segura. No almacenamos datos de tu tarjeta.</p>
          <ExternalLink size={13} className="mt-0.5 flex-shrink-0" />
        </div>
      )}
      {errors.paymentMethod && <p className="text-red-500 text-xs mt-2">{String(errors.paymentMethod.message)}</p>}
    </div>
  );
}
