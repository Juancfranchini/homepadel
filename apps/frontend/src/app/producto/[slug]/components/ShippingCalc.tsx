'use client';

import { MessageCircle, Shield, Truck } from 'lucide-react';
import { useShippingRates } from '@/hooks/useShippingRates';
import { useEnvioFlex } from '@/hooks/useEnvioFlex';
import { formatPrice } from '@/lib/utils';

export default function ShippingCalc() {
  const { flatRate, freeShippingThreshold } = useShippingRates();
  const flex = useEnvioFlex();
  const flexDesde = flex.activo && flex.zonas.length > 0 ? Math.min(...flex.zonas.map((z) => z.precio)) : null;

  return (
    <div className="bg-chip border border-line rounded-lg sm:rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck size={14} className="text-brand-fg" />
        <p className="text-sm font-semibold text-fg">Opciones de envío</p>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-3"><span className="text-fg font-semibold">Correo Argentino</span><span className="text-fg-soft">Tarifa {formatPrice(flatRate)}</span></div>
        {flexDesde !== null && <div className="flex items-center justify-between gap-3"><span className="text-fg font-semibold">Envío Flex en moto (AMBA)</span><span className="text-fg-soft">Desde {formatPrice(flexDesde)}</span></div>}
        <div className="flex items-center justify-between gap-3"><span className="text-fg-soft">Andreani u OCA</span><span className="text-amber-300 light:text-amber-700 flex items-center gap-1"><MessageCircle size={11} />Costo a coordinar</span></div>
      </div>
      <p className="text-[10px] text-fg-muted mt-3">Correo Argentino es gratis desde {formatPrice(freeShippingThreshold)}.{flexDesde !== null && ' Envío Flex según tu partido o localidad.'} El importe definitivo se muestra en el checkout.</p>
      <p className="text-[10px] text-fg-muted mt-2 flex items-center gap-1"><Shield size={10} className="text-brand-fg" />No realizamos cotizaciones automáticas por código postal.</p>
    </div>
  );
}
