'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Wallet, Landmark, Truck, ChevronRight } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { getImageUrl } from '@/lib/utils';

export default function MediosPagoPage() {
  const { mercadopago, transferencia, visa, mastercard, amex, ca, oca, andreani, isLoaded } = usePaymentMethods() as any;

  if (!isLoaded) return null;

  const paymentMethods = [
    { name: 'Mercado Pago', icon: Wallet, logo: mercadopago?.logo, active: mercadopago?.active !== false, desc: 'Paga con tu cuenta de Mercado Pago, tarjeta de credito, debito o efectivo.' },
    { name: 'Transferencia Bancaria', icon: Landmark, logo: transferencia?.logo, active: transferencia?.active !== false, desc: 'Transferi directamente desde tu banco. Te enviamos los datos por email.' },
    { name: 'VISA', icon: CreditCard, logo: visa?.logo, active: visa?.active !== false, desc: 'Aceptamos todas las tarjetas VISA.' },
    { name: 'Mastercard', icon: CreditCard, logo: mastercard?.logo, active: mastercard?.active !== false, desc: 'Aceptamos todas las tarjetas Mastercard.' },
    { name: 'American Express', icon: CreditCard, logo: amex?.logo, active: amex?.active !== false, desc: 'Aceptamos American Express.' },
  ].filter((m) => m.active);

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
        <p className="text-[#8A8A85] mb-10">Trabajamos con los medios de pago mas seguros del mercado.</p>

        <div className="space-y-4 mb-12">
          {paymentMethods.map((method) => (
            <div key={method.name} className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-5 flex items-center gap-4">
              <div className="w-16 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                {method.logo ? (
                  <img src={getImageUrl(method.logo)} alt={method.name} className="w-full h-full object-cover" />
                ) : (
                  <method.icon size={24} className="text-[#B7D31A]" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-[#F7F6F7] font-semibold text-sm">{method.name}</h3>
                <p className="text-[#8A8A85] text-xs mt-0.5">{method.desc}</p>
              </div>
              <ChevronRight size={16} className="text-[#8A8A85]" />
            </div>
          ))}
        </div>

        {shippingMethods.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-[#F7F6F7] mb-4">Medios de Envio</h2>
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
