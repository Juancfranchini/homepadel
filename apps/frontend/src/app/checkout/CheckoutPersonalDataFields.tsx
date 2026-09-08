'use client';

import { User } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

const inputClass = 'w-full bg-[#161818] border border-[#1A1F21] rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-[#161818] border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-red-500 transition-colors';

interface Props {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function CheckoutPersonalDataFields({ register, errors }: Props) {
  return (
    <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">1</div>
        <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><User size={16} /> Datos personales</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Nombre completo *</label>
          <input {...register('name')} type="text" placeholder="Juan Garcia" className={errors.name ? errorInputClass : inputClass} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Email *</label>
          <input {...register('email')} type="email" placeholder="juan@email.com" className={errors.email ? errorInputClass : inputClass} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Teléfono *</label>
          <input {...register('phone')} type="tel" placeholder="+54 11 1234 5678" className={errors.phone ? errorInputClass : inputClass} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{String(errors.phone.message)}</p>}
        </div>
      </div>
    </div>
  );
}
