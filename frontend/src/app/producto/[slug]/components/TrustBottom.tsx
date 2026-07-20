'use client';

import { useState, useEffect } from 'react';
import { Truck, RefreshCw, Shield, Check, MessageCircle, Star, Zap, Heart, Lock, Headphones, Gift, Award, Clock, ThumbsUp } from 'lucide-react';
import { createElement } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const ICON_MAP: Record<string, any> = { Truck, RefreshCw, Shield, Check, MessageCircle, Star, Zap, Heart, Lock, Headphones, Gift, Award, Clock, ThumbsUp };

const FALLBACK = [
  { icon: 'Truck', title: 'ENVIOS A TODO EL PAIS', subtitle: 'Recibi tu pedido en cualquier punto del pais' },
  { icon: 'RefreshCw', title: '30 DIAS PARA CAMBIOS', subtitle: 'Si no estas conforme, podes cambiar tu producto' },
  { icon: 'Shield', title: 'GARANTIA OFICIAL', subtitle: 'Todos nuestros productos cuentan con garantia oficial' },
  { icon: 'Check', title: 'PAGOS 100% SEGUROS', subtitle: 'Protegemos tus datos con el mas alto nivel de seguridad' },
  { icon: 'MessageCircle', title: 'ATENCION PERSONALIZADA', subtitle: 'Te asesoramos por WhatsApp en todo momento' },
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
    <section className="py-8 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#B7D31A]/20">
          {items.map((t, i) => {
            const IconComp = ICON_MAP[t.icon] || Shield;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2 first:pl-0 last:pr-0">
                <span className="text-[#B7D31A] flex-shrink-0">{createElement(IconComp, { size: 24 })}</span>
                <div>
                  <p className="text-[#F7F6F7] font-semibold text-[11px] uppercase tracking-wide leading-snug">{t.title}</p>
                  <p className="text-[#C7C7C0] text-[10px] leading-snug mt-0.5">{t.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
