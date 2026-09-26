'use client';

import { Truck, Store } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CheckoutFormData } from './checkoutSchema';
import { formatPrice } from '@/lib/utils';

const inputClass = 'w-full bg-[#161818] border border-[#1A1F21] rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-[#161818] border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-red-500 transition-colors';

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman',
];

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  selectedMethod: CheckoutFormData['shippingMethod'];
  correoCost: number;
  storeAddress?: string;
}

const SHIPPING_OPTIONS: { value: CheckoutFormData['shippingMethod']; label: string; detail: string }[] = [
  { value: 'correo_argentino', label: 'Correo Argentino', detail: 'Opción principal' },
  { value: 'retiro_local', label: 'Retiro en el local', detail: 'Sin costo' },
  { value: 'andreani', label: 'Andreani', detail: 'Costo a coordinar por WhatsApp' },
  { value: 'oca', label: 'OCA', detail: 'Costo a coordinar por WhatsApp' },
];

function shippingOptionDetail(option: { value: CheckoutFormData['shippingMethod']; detail: string }, correoCost: number): string {
  if (option.value === 'correo_argentino') return correoCost === 0 ? 'Envío gratis' : formatPrice(correoCost);
  if (option.value === 'retiro_local') return 'Sin costo';
  return option.detail;
}

export default function CheckoutShippingFields({ register, errors, selectedMethod, correoCost, storeAddress }: Props) {
  const esRetiro = selectedMethod === 'retiro_local';

  return (
    <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">2</div>
        <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><Truck size={16} /> Dirección de envío</h2>
      </div>

      <div className="mb-5">
        <p className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-3">Cómo lo recibís</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SHIPPING_OPTIONS.map((option) => (
            <label key={option.value} className={'rounded-xl border p-3 cursor-pointer transition-colors ' + (selectedMethod === option.value ? 'border-[#B7D31A] bg-[#B7D31A]/5' : 'border-[#1A1F21] hover:border-[#B7D31A]/30')}>
              <input {...register('shippingMethod')} type="radio" value={option.value} className="sr-only" />
              <span className="block text-sm font-bold text-[#F7F6F7]">{option.label}</span>
              <span className="block text-[11px] text-[#8A8A85] mt-1">{shippingOptionDetail(option, correoCost)}</span>
            </label>
          ))}
        </div>
        {selectedMethod !== 'correo_argentino' && selectedMethod !== 'retiro_local' && (
          <p className="text-xs text-amber-300 mt-3">No se realizará ningún cobro: enviaremos el detalle del pedido por WhatsApp para coordinar el costo.</p>
        )}
      </div>

      {esRetiro ? (
        <div className="rounded-xl border border-[#1A1F21] bg-[#161818] p-4 flex items-start gap-3">
          <Store size={18} className="text-[#B7D31A] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#C7C7C0]">
            <p className="font-semibold text-[#F7F6F7] mb-1">Retirás vos por el local</p>
            {storeAddress ? <p>{storeAddress}</p> : <p>Te vamos a escribir para coordinar el retiro apenas se confirme el pago.</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="checkout-street" className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Calle y número *</label>
            <input id="checkout-street" {...register('street')} type="text" autoComplete="street-address" placeholder="Escribí tu calle y número" className={errors.street ? errorInputClass : inputClass} />
            {errors.street && <p className="text-red-500 text-xs mt-1">{String(errors.street.message)}</p>}
          </div>
          <div>
            <label htmlFor="checkout-city" className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Ciudad *</label>
            <input id="checkout-city" {...register('city')} type="text" autoComplete="address-level2" placeholder="Escribí tu ciudad" className={errors.city ? errorInputClass : inputClass} />
            {errors.city && <p className="text-red-500 text-xs mt-1">{String(errors.city.message)}</p>}
          </div>
          <div>
            <label htmlFor="checkout-postal-code" className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Código postal *</label>
            <input id="checkout-postal-code" {...register('postalCode')} type="text" inputMode="numeric" autoComplete="postal-code" placeholder="Escribí tu código postal" className={errors.postalCode ? errorInputClass : inputClass} />
            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{String(errors.postalCode.message)}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-province" className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Provincia *</label>
            <select id="checkout-province" {...register('province')} autoComplete="address-level1" className={errors.province ? errorInputClass : inputClass}>
              <option value="">Seleccioná una provincia</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <p className="text-red-500 text-xs mt-1">{String(errors.province.message)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
