'use client';

import Link from 'next/link';
import { CreditCard, ExternalLink, Landmark, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { getImageUrl } from '@/lib/utils';

export default function MediosPagoPage() {
  const { mercadopago, transferencia, ca, oca, andreani, isLoaded } = usePaymentMethods();

  if (!isLoaded) return null;

  const shippingMethods = [
    { name: 'Correo Argentino', logo: ca?.logo, active: ca?.active !== false },
    { name: 'OCA', logo: oca?.logo, active: oca?.active !== false },
    { name: 'Andreani', logo: andreani?.logo, active: andreani?.active !== false },
  ].filter((m) => m.active);

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
          <span className="text-[#F7F6F7]">Medios de Pago</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#F7F6F7] mb-2">Medios de Pago</h1>
        <p className="text-[#8A8A85] mb-10">{transferencia.active === true ? 'Pagá con Mercado Pago o solicitá una compra por transferencia.' : 'El pago se procesa exclusivamente en Mercado Pago Checkout Pro.'}</p>

        <div className="bg-[#0C0C0C] rounded-2xl border border-[#B7D31A]/25 p-6 mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-11 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
              {mercadopago.logo ? <img src={getImageUrl(mercadopago.logo)} alt="Mercado Pago" className="w-full h-full object-contain" /> : <Wallet size={28} className="text-[#B7D31A]" />}
            </div>
            <div>
              <h2 className="text-[#F7F6F7] font-semibold">Mercado Pago Checkout Pro</h2>
              <p className="text-[#C7C7C0] text-sm">Elegí tarjeta, saldo u otro medio disponible una vez dentro de Mercado Pago.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 rounded-xl bg-[#050606] p-4"><CreditCard size={17} className="text-[#B7D31A] mt-0.5" /><p className="text-[#C7C7C0]">Los datos de la tarjeta se ingresan y procesan fuera de Home Pádel.</p></div>
            <div className="flex items-start gap-2 rounded-xl bg-[#050606] p-4"><ShieldCheck size={17} className="text-[#B7D31A] mt-0.5" /><p className="text-[#C7C7C0]">No almacenamos números de tarjeta ni códigos de seguridad.</p></div>
          </div>
          <p className="flex items-center gap-2 text-xs text-[#8A8A85] mt-4"><ExternalLink size={13} />Al realizar el pedido, te redirigimos a Mercado Pago para completar la compra.</p>
        </div>

        {transferencia.active === true && (
          <div className="bg-[#0C0C0C] rounded-2xl border border-[#0D0F0F] p-6 -mt-8 mb-12 flex items-start gap-3">
            <Landmark size={22} className="text-[#B7D31A] mt-0.5" />
            <div><h2 className="text-[#F7F6F7] font-semibold">Transferencia bancaria</h2><p className="text-[#C7C7C0] text-sm mt-1">Al solicitarla, avisamos a la tienda y en minutos nos contactamos para que termines tu compra.</p></div>
          </div>
        )}

        {shippingMethods.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-[#F7F6F7] mb-4">Medios de Envío</h2>
            <div className="flex flex-wrap gap-4">
              {shippingMethods.map((method) => (
                <div key={method.name} className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-4 flex items-center gap-3">
                  <div className="w-16 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {method.logo ? (
                      <img src={getImageUrl(method.logo)} alt={method.name} className="w-full h-full object-cover" />
                    ) : (
                      <Truck size={24} className="text-[#B7D31A]" />
                    )}
                  </div>
                  <span className="text-[#F7F6F7] font-semibold text-sm">{method.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
