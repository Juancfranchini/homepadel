'use client';

import { MessageCircle, Shield, Truck } from 'lucide-react';
import { useShippingRates } from '@/hooks/useShippingRates';
import { formatPrice } from '@/lib/utils';

export default function ShippingCalc() {
  const { flatRate, freeShippingThreshold } = useShippingRates();

  return (
    <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-lg sm:rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck size={14} className="text-[#B7D31A]" />
        <p className="text-sm font-semibold text-[#F7F6F7]">Opciones de envío</p>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-3"><span className="text-[#F7F6F7] font-semibold">Correo Argentino</span><span className="text-[#C7C7C0]">Tarifa {formatPrice(flatRate)}</span></div>
        <div className="flex items-center justify-between gap-3"><span className="text-[#C7C7C0]">Andreani u OCA</span><span className="text-amber-300 flex items-center gap-1"><MessageCircle size={11} />Costo a coordinar</span></div>
      </div>
      <p className="text-[10px] text-[#8A8A85] mt-3">Correo Argentino es gratis desde {formatPrice(freeShippingThreshold)}. El importe definitivo se muestra en el checkout.</p>
      <p className="text-[10px] text-[#8A8A85] mt-2 flex items-center gap-1"><Shield size={10} className="text-[#B7D31A]" />No realizamos cotizaciones automáticas por código postal.</p>
    </div>
  );
}
