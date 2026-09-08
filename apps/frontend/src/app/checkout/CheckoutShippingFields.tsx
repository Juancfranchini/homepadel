'use client';

import { Truck } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

const inputClass = 'w-full bg-[#161818] border border-[#1A1F21] rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-[#161818] border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-red-500 transition-colors';

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman',
];

interface Props {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function CheckoutShippingFields({ register, errors }: Props) {
  return (
    <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">2</div>
        <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><Truck size={16} /> Dirección de envío</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Calle y número *</label>
          <input {...register('street')} type="text" placeholder="Av. Corrientes 1234" className={errors.street ? errorInputClass : inputClass} />
          {errors.street && <p className="text-red-500 text-xs mt-1">{String(errors.street.message)}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Ciudad *</label>
          <input {...register('city')} type="text" placeholder="Buenos Aires" className={errors.city ? errorInputClass : inputClass} />
          {errors.city && <p className="text-red-500 text-xs mt-1">{String(errors.city.message)}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Código postal *</label>
          <input {...register('postalCode')} type="text" placeholder="1043" className={errors.postalCode ? errorInputClass : inputClass} />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{String(errors.postalCode.message)}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Provincia *</label>
          <select {...register('province')} className={errors.province ? errorInputClass : inputClass}>
            <option value="">Selecciona una provincia</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.province && <p className="text-red-500 text-xs mt-1">{String(errors.province.message)}</p>}
        </div>
      </div>
    </div>
  );
}
