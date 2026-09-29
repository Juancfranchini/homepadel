'use client';

import { useRef } from 'react';
import { Bike, Package, Store, Truck, type LucideIcon } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { formatPrice } from '@/lib/utils';
import { CheckoutFormData } from './checkoutSchema';
import { CheckoutFlex } from './useCheckoutFlex';

type Metodo = CheckoutFormData['shippingMethod'];

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  selectedMethod: Metodo;
  correoCost: number;
  andreaniGratis: boolean;
  flex: CheckoutFlex;
}

const TRANSPORTISTAS: { value: Metodo; label: string; icon: LucideIcon }[] = [
  { value: 'correo_argentino', label: 'Correo Argentino', icon: Truck },
  { value: 'andreani', label: 'Andreani', icon: Package },
  { value: 'flex', label: 'Envío Flex (moto)', icon: Bike },
  { value: 'oca', label: 'OCA', icon: Package },
];

/** Precio o condición de cada transportista. `gratis` pinta el texto en verde. */
function detalle(metodo: Metodo, correoCost: number, andreaniGratis: boolean, flex: CheckoutFlex): { texto: string; gratis?: boolean } {
  if (metodo === 'correo_argentino') return correoCost === 0 ? { texto: 'Envío gratis', gratis: true } : { texto: formatPrice(correoCost) };
  if (metodo === 'andreani') return andreaniGratis ? { texto: 'Envío gratis', gratis: true } : { texto: 'Costo por WhatsApp' };
  if (metodo === 'flex') return flex.zona ? { texto: `${formatPrice(flex.zona.precio)} · ${flex.zona.localidad}` } : { texto: 'Buenos Aires · según tu localidad' };
  return { texto: 'Costo por WhatsApp' };
}

const tarjeta = (activa: boolean) =>
  'flex items-start gap-2.5 rounded-xl border-2 p-3 cursor-pointer transition-colors ' +
  (activa ? 'border-[#B7D31A] bg-[#B7D31A]/10' : 'border-chip hover:border-[#B7D31A]/40');

/**
 * Primero envío o retiro (dos botones grandes); con envío, los transportistas
 * a la vista en una grilla fija, con su precio. Todo se elige con un toque.
 */
export default function CheckoutShippingOptions({ register, selectedMethod, correoCost, andreaniGratis, flex }: Props) {
  const esRetiro = selectedMethod === 'retiro_local';
  // Al volver de "Retiro" se recupera el transportista que tenía elegido.
  const ultimoEnvio = useRef<Metodo>('correo_argentino');
  if (!esRetiro) ultimoEnvio.current = selectedMethod;
  const transportistas = TRANSPORTISTAS.filter((t) => t.value !== 'flex' || flex.info.activo);

  return (
    <div className="mb-5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-fg-soft uppercase tracking-wide mb-2">Cómo lo recibís</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => flex.elegirMetodo(ultimoEnvio.current)} aria-pressed={!esRetiro} className={tarjeta(!esRetiro) + ' text-left'}>
            <Truck size={20} className="text-brand-fg flex-shrink-0 mt-0.5" />
            <span><span className="block text-sm font-bold text-fg">Envío a domicilio</span><span className="block text-xs text-fg-soft mt-0.5">A todo el país</span></span>
          </button>
          <label className={tarjeta(esRetiro)}>
            <input {...register('shippingMethod')} type="radio" value="retiro_local" className="sr-only" />
            <Store size={20} className="text-brand-fg flex-shrink-0 mt-0.5" />
            <span><span className="block text-sm font-bold text-fg">Retiro en el local</span><span className="block text-xs font-semibold text-green-500 light:text-green-700 mt-0.5">Sin costo</span></span>
          </label>
        </div>
      </div>

      {!esRetiro && (
        <div>
          <p className="text-xs font-semibold text-fg-soft uppercase tracking-wide mb-2">Tipo de envío</p>
          <div className="grid grid-cols-2 gap-2">
            {transportistas.map(({ value, label, icon: Icon }) => {
              const d = detalle(value, correoCost, andreaniGratis, flex);
              return (
                <label key={value} className={tarjeta(selectedMethod === value)}>
                  <input {...register('shippingMethod')} type="radio" value={value} className="sr-only" />
                  <Icon size={16} className="text-brand-fg flex-shrink-0 mt-0.5" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-fg leading-tight">{label}</span>
                    <span className={'block text-xs mt-1 ' + (d.gratis ? 'font-semibold text-green-500 light:text-green-700' : 'text-fg-soft')}>{d.texto}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {(selectedMethod === 'oca' || (selectedMethod === 'andreani' && !andreaniGratis)) && (
            <p className="text-xs text-amber-300 light:text-amber-700 mt-3">No se realizará ningún cobro: enviaremos el detalle del pedido por WhatsApp para coordinar el costo.</p>
          )}
        </div>
      )}
    </div>
  );
}
