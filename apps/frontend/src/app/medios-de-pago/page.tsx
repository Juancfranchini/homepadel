'use client';

import Link from 'next/link';
import { CreditCard, ExternalLink, Landmark, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { getImageUrl } from '@/lib/utils';

export default function MediosPagoPage() {
  const { mercadopago, transferencia, ca, oca, andreani, isLoaded } = usePaymentMethods();

  if (!isLoaded) return null;

  const shippingMethods = [
    { name: 'Correo Argentino', logo: ca?.logo, detail: 'Opción principal con tarifa plana visible en el checkout' },
    { name: 'OCA', logo: oca?.logo, detail: 'Opción secundaria · Costo a coordinar por WhatsApp' },
    { name: 'Andreani', logo: andreani?.logo, detail: 'Opción secundaria · Costo a coordinar por WhatsApp' },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-fg-muted">
          <Link href="/" className="hover:text-fg transition-colors">Inicio</Link><span>/</span>
          <span className="text-fg">Medios de Pago</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-fg mb-2">Medios de Pago</h1>
        <p className="text-fg-muted mb-10">{transferencia.active === true ? 'Pagá con Mercado Pago o por transferencia bancaria.' : 'El pago se procesa exclusivamente en Mercado Pago Checkout Pro.'}</p>

        <div className="bg-panel rounded-2xl border border-[#B7D31A]/25 p-6 mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-11 rounded-lg bg-fg/5 flex items-center justify-center overflow-hidden flex-shrink-0">
              {mercadopago.logo ? <img src={getImageUrl(mercadopago.logo)} alt="Mercado Pago" className="w-full h-full object-contain" /> : <Wallet size={28} className="text-brand-fg" />}
            </div>
            <div>
              <h2 className="text-fg font-semibold">Mercado Pago Checkout Pro</h2>
              <p className="text-fg-soft text-sm">Elegí tarjeta, saldo u otro medio disponible una vez dentro de Mercado Pago.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 rounded-xl bg-page p-4"><CreditCard size={17} className="text-brand-fg mt-0.5" /><p className="text-fg-soft">Los datos de la tarjeta se ingresan y procesan fuera de Home Pádel.</p></div>
            <div className="flex items-start gap-2 rounded-xl bg-page p-4"><ShieldCheck size={17} className="text-brand-fg mt-0.5" /><p className="text-fg-soft">No almacenamos números de tarjeta ni códigos de seguridad.</p></div>
          </div>
          <p className="flex items-center gap-2 text-xs text-fg-muted mt-4"><ExternalLink size={13} />Al realizar el pedido, te redirigimos a Mercado Pago para completar la compra.</p>
        </div>

        {transferencia.active === true && (
          <div className="bg-panel rounded-2xl border border-line p-6 -mt-8 mb-12 flex items-start gap-3">
            <Landmark size={22} className="text-brand-fg mt-0.5" />
            <div><h2 className="text-fg font-semibold">Transferencia bancaria</h2><p className="text-fg-soft text-sm mt-1">Al confirmar el pedido te mostramos los datos de la cuenta para transferir y nos mandás el comprobante por WhatsApp.</p></div>
          </div>
        )}

        {shippingMethods.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-fg mb-4">Medios de Envío</h2>
            <div className="flex flex-wrap gap-4">
              {shippingMethods.map((method) => (
                <div key={method.name} className="bg-panel rounded-xl border border-line p-4 flex items-center gap-3">
                  <div className="w-16 h-10 rounded-lg bg-fg/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {method.logo ? (
                      <img src={getImageUrl(method.logo)} alt={method.name} className="w-full h-full object-cover" />
                    ) : (
                      <Truck size={24} className="text-brand-fg" />
                    )}
                  </div>
                  <div><span className="text-fg font-semibold text-sm">{method.name}</span><p className="text-fg-muted text-xs mt-0.5">{method.detail}</p></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
