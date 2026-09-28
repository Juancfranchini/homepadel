'use client';

import { Bike, Clock } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { formatPrice } from '@/lib/utils';
import { CheckoutFormData } from './checkoutSchema';
import { CheckoutFlex } from './useCheckoutFlex';

const inputClass = 'w-full bg-field border border-chip rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-field border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-red-500 transition-colors';
const labelClass = 'block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1';

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  flex: CheckoutFlex;
}

/** Domicilio para Envío Flex: la localidad se elige de la lista de zonas, no se escribe. */
export default function CheckoutFlexFields({ register, errors, flex }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-chip bg-field p-4 text-sm text-fg-soft flex items-start gap-3">
        <Bike size={18} className="text-brand-fg mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-fg mb-1">Te lo llevamos en moto a tu casa</p>
          <p className="flex items-center gap-1.5 text-xs"><Clock size={12} className="flex-shrink-0" />Se despacha al mediodía y se reparte a partir de las 16 hs.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="checkout-flex-city" className={labelClass}>Partido o localidad *</label>
          <select id="checkout-flex-city" {...register('city')} className={errors.city ? errorInputClass : inputClass}>
            <option value="">Elegí dónde lo recibís</option>
            {flex.info.zonas.map((zona) => (
              <optgroup key={zona.zona} label={`Zona ${zona.zona} · ${formatPrice(zona.precio)}`}>
                {zona.localidades.map((localidad) => <option key={localidad} value={localidad}>{localidad}</option>)}
              </optgroup>
            ))}
          </select>
          {errors.city ? (
            <p className="text-red-500 light:text-red-600 text-xs mt-1">Elegí tu partido o localidad</p>
          ) : (
            <p className="text-fg-muted text-xs mt-1">Si tu barrio no aparece, elegí el partido al que pertenece. ¿No está? Elegí Correo Argentino.</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="checkout-flex-street" className={labelClass}>Calle y número *</label>
          <input id="checkout-flex-street" {...register('street')} type="text" autoComplete="street-address" placeholder="Escribí tu calle y número" className={errors.street ? errorInputClass : inputClass} />
          {errors.street && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.street.message)}</p>}
        </div>
        <div>
          <label htmlFor="checkout-flex-postal-code" className={labelClass}>Código postal *</label>
          <input id="checkout-flex-postal-code" {...register('postalCode')} type="text" inputMode="numeric" autoComplete="postal-code" placeholder="Escribí tu código postal" className={errors.postalCode ? errorInputClass : inputClass} />
          {errors.postalCode && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.postalCode.message)}</p>}
        </div>
        <div className="flex items-end">
          <p className="text-sm text-fg-soft pb-2.5">{flex.zona ? <>Zona {flex.zona.zona} · <strong className="text-fg">{formatPrice(flex.zona.precio)}</strong></> : 'Elegí tu localidad para ver el costo'}</p>
        </div>
      </div>
    </div>
  );
}

/** Aviso para quien eligió otro envío y escribió una localidad donde llega Flex. */
export function SugerenciaFlex({ flex }: { flex: CheckoutFlex }) {
  if (flex.esFlex || !flex.zona) return null;
  return (
    <div className="mt-3 rounded-xl border border-[#B7D31A]/40 bg-[#B7D31A]/5 p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="text-fg-soft"><Bike size={14} className="inline mr-1.5 text-brand-fg" />En {flex.zona.localidad} tenés Envío Flex en moto por <strong className="text-fg">{formatPrice(flex.zona.precio)}</strong>.</span>
      <button type="button" onClick={flex.usarFlex} className="text-xs font-bold uppercase tracking-wide text-brand-fg hover:underline">Usar Envío Flex</button>
    </div>
  );
}
