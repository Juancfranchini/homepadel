'use client';

import { User } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CheckoutFormData } from './checkoutSchema';

const inputClass = 'w-full bg-field border border-chip rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-field border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-red-500 transition-colors';

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export default function CheckoutPersonalDataFields({ register, errors }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">1</div>
        <h2 className="font-black text-base uppercase tracking-wide text-fg flex items-center gap-2"><User size={16} /> Datos personales</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="checkout-name" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Nombre completo *</label>
          <input id="checkout-name" {...register('name')} type="text" autoComplete="name" placeholder="Escribí tu nombre completo" className={errors.name ? errorInputClass : inputClass} />
          {errors.name && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.name.message)}</p>}
        </div>
        <div>
          <label htmlFor="checkout-email" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Email *</label>
          <input id="checkout-email" {...register('email')} type="email" autoComplete="email" placeholder="Escribí tu email" className={errors.email ? errorInputClass : inputClass} />
          {errors.email && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.email.message)}</p>}
        </div>
        <div>
          <label htmlFor="checkout-phone" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Teléfono *</label>
          <input id="checkout-phone" {...register('phone')} type="tel" autoComplete="tel" placeholder="Escribí tu teléfono" className={errors.phone ? errorInputClass : inputClass} />
          {errors.phone && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.phone.message)}</p>}
        </div>
      </div>
    </div>
  );
}
