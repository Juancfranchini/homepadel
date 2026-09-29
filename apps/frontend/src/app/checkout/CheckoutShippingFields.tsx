'use client';

import { Truck, Store } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CheckoutFormData } from './checkoutSchema';
import { PROVINCIAS } from '@/lib/provincias';
import CheckoutFlexFields, { SugerenciaFlex } from './CheckoutFlexFields';
import { CheckoutFlex } from './useCheckoutFlex';
import CheckoutDireccionesGuardadas from './CheckoutDireccionesGuardadas';
import CheckoutShippingOptions from './CheckoutShippingOptions';
import { DireccionGuardada } from '@/lib/api';

const inputClass = 'w-full bg-field border border-chip rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-field border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-red-500 transition-colors';


interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  selectedMethod: CheckoutFormData['shippingMethod'];
  correoCost: number;
  /** Compra desde el monto de envío gratis: Andreani también es gratis y se paga online. */
  andreaniGratis: boolean;
  storeAddress?: string;
  flex: CheckoutFlex;
  direcciones?: DireccionGuardada[];
  onUsarDireccion?: (d: DireccionGuardada) => void;
}

export default function CheckoutShippingFields({ register, errors, selectedMethod, correoCost, andreaniGratis, storeAddress, flex, direcciones = [], onUsarDireccion = () => {} }: Props) {
  const esRetiro = selectedMethod === 'retiro_local';

  return (
    <div className="bg-card rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">2</div>
        <h2 className="font-black text-base uppercase tracking-wide text-fg flex items-center gap-2"><Truck size={16} /> Entrega</h2>
      </div>

      <CheckoutShippingOptions register={register} selectedMethod={selectedMethod} correoCost={correoCost} andreaniGratis={andreaniGratis} flex={flex} />

      {!esRetiro && <CheckoutDireccionesGuardadas direcciones={direcciones} onUsar={onUsarDireccion} />}
      {selectedMethod === 'flex' ? (
        <CheckoutFlexFields register={register} errors={errors} flex={flex} />
      ) : esRetiro ? (
        <div className="rounded-xl border border-chip bg-field p-4 flex items-start gap-3">
          <Store size={18} className="text-brand-fg mt-0.5 flex-shrink-0" />
          <div className="text-sm text-fg-soft">
            <p className="font-semibold text-fg mb-1">Retirás vos por el local</p>
            {storeAddress ? <p>{storeAddress}</p> : <p>Te vamos a escribir para coordinar el retiro apenas se confirme el pago.</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="checkout-street" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Calle y número *</label>
            <input id="checkout-street" {...register('street')} type="text" autoComplete="street-address" placeholder="Escribí tu calle y número" className={errors.street ? errorInputClass : inputClass} />
            {errors.street && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.street.message)}</p>}
          </div>
          <div>
            <label htmlFor="checkout-city" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Ciudad *</label>
            <input id="checkout-city" {...register('city')} type="text" autoComplete="address-level2" placeholder="Escribí tu ciudad" className={errors.city ? errorInputClass : inputClass} />
            {errors.city && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.city.message)}</p>}
          </div>
          <div>
            <label htmlFor="checkout-postal-code" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Código postal *</label>
            <input id="checkout-postal-code" {...register('postalCode')} type="text" inputMode="numeric" autoComplete="postal-code" placeholder="Escribí tu código postal" className={errors.postalCode ? errorInputClass : inputClass} />
            {errors.postalCode && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.postalCode.message)}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-province" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Provincia *</label>
            <select id="checkout-province" {...register('province')} autoComplete="address-level1" className={errors.province ? errorInputClass : inputClass}>
              <option value="">Seleccioná una provincia</option>
              {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.province.message)}</p>}
          </div>
        </div>
      )}
      {!esRetiro && <SugerenciaFlex flex={flex} />}
    </div>
  );
}
