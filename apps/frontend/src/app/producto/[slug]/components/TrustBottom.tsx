'use client';

import { useState, useEffect } from 'react';
import { Truck, RefreshCw, Shield, Check, MessageCircle, Star, Zap, Heart, Lock, Headphones, Gift, Award, Clock, ThumbsUp, CreditCard } from 'lucide-react';
import { createElement } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const ICON_MAP: Record<string, any> = { Truck, RefreshCw, Shield, Check, MessageCircle, Star, Zap, Heart, Lock, Headphones, Gift, Award, Clock, ThumbsUp, CreditCard };

const FALLBACK = [
  { icon: 'Truck', title: 'ENVIOS A TODO EL PAIS', subtitle: 'Recibi tu pedido a domicilio o en sucursal.' },
  { icon: 'RefreshCw', title: '30 DIAS PARA CAMBIOS', subtitle: 'Cambia tu producto de forma simple y rapida.' },
  { icon: 'Shield', title: 'GARANTIA OFICIAL', subtitle: 'Productos originales con garantia y respaldo oficial.' },
  { icon: 'MessageCircle', title: 'ATENCION PERSONALIZADA', subtitle: 'Te asesoramos por WhatsApp antes y despues de tu compra.' },
  { icon: 'Check', title: 'COMPRA 100% SEGURA', subtitle: 'Compra online de forma rapida, simple y protegida.' },
  { icon: 'Lock', title: 'MULTIPLES MEDIOS DE PAGO', subtitle: 'Elegi la forma de pago que mejor se adapte a vos.' },
];

interface TrustItem { icon: string; title: string; subtitle: string; }

export default function TrustBottom() {
  const [items, setItems] = useState<TrustItem[]>(FALLBACK);

  useEffect(() => {
    fetch(API_URL + '/site-sections/trust_bottom')
      .then((res) => res.json())
      .then((data) => {
        const d = data?.data || data;
        if (d?.items && d.items.length > 0 && d.active !== false) {
          setItems(d.items);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile: scroll horizontal marquesina */}
        <div className="md:hidden overflow-x-auto -mx-3 px-3">
          <div className="flex gap-3 min-w-max animate-scroll">
            {[...items, ...items].map((t, i) => {
              const IconComp = ICON_MAP[t.icon] || Shield;
              return (
                <div key={i} className="flex items-center gap-2.5 bg-[#0A0F12] border border-[#0D0F0F] rounded-lg px-3 py-2 min-w-[160px] max-w-[180px]">
                  <span className="text-[#B7D31A] flex-shrink-0">{createElement(IconComp, { size: 20 })}</span>
                  <div className="min-w-0">
                    <p className="text-[#F7F6F7] font-semibold text-[9px] uppercase tracking-wide leading-tight">{t.title}</p>
                    <p className="text-[#C7C7C0] text-[9px] leading-tight mt-0.5 line-clamp-2">{t.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tablet y Desktop: grid */}
        <div className={'hidden md:grid gap-4 ' + (items.length === 6 ? 'md:grid-cols-6' : items.length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4')}>
          {items.map((t, i) => {
            const IconComp = ICON_MAP[t.icon] || Shield;
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <span className="text-[#B7D31A] flex-shrink-0">{createElement(IconComp, { size: 24 })}</span>
                <div className="min-w-0">
                  <p className="text-[#F7F6F7] font-semibold text-[10px] sm:text-[11px] uppercase tracking-wide leading-tight">{t.title}</p>
                  <p className="text-[#C7C7C0] text-[9px] sm:text-[10px] leading-tight mt-0.5 line-clamp-2">{t.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}