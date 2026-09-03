'use client';

import { Truck, CreditCard, RefreshCw, Shield, Lock, Package, Sparkles, Heart, Star, Check } from 'lucide-react';
import { Benefit } from '@/types';

interface Props {
  benefits: Benefit[];
}

const FALLBACK = [
  { id: '1', title: 'ENVIOS A TODO EL PAIS', description: 'Recibi tu pedido a domicilio o en sucursal.', icon: 'Truck' },
  { id: '2', title: 'GARANTIA OFICIAL', description: 'Productos originales con garantia y respaldo oficial.', icon: 'Shield' },
  { id: '3', title: '9 CUOTAS SIN INTERES', description: 'Paga tu compra en hasta 9 cuotas sin interes.', icon: 'CreditCard' },
  { id: '4', title: 'ATENCION PERSONALIZADA', description: 'Te asesoramos antes y despues de tu compra.', icon: 'Star' },
];

function getIcon(iconName: string, size: number = 28): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    'Truck': <Truck size={size} />, 'truck': <Truck size={size} />,
    'CreditCard': <CreditCard size={size} />, 'credit-card': <CreditCard size={size} />, 'creditcard': <CreditCard size={size} />,
    'RefreshCw': <RefreshCw size={size} />, 'refresh-cw': <RefreshCw size={size} />, 'refreshcw': <RefreshCw size={size} />,
    'Shield': <Shield size={size} />, 'shield': <Shield size={size} />,
    'Lock': <Lock size={size} />, 'lock': <Lock size={size} />,
    'Package': <Package size={size} />, 'package': <Package size={size} />,
    'Sparkles': <Sparkles size={size} />, 'sparkles': <Sparkles size={size} />,
    'Heart': <Heart size={size} />, 'heart': <Heart size={size} />,
    'Star': <Star size={size} />, 'star': <Star size={size} />,
    'Check': <Check size={size} />, 'check': <Check size={size} />,
  };
  return icons[iconName] || <Truck size={size} />;
}

export default function BenefitsStrip({ benefits }: Props) {
  const items = benefits && benefits.length > 0 ? benefits : FALLBACK;

  return (
    <section className="bg-[#050606] border-t border-b border-[#0D0F0F] py-3 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: scroll horizontal efecto marquesina */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-4 min-w-max animate-scroll">
            {[...items, ...items].map((b, idx) => (
              <div key={b.id + '-' + idx} className="flex items-center gap-3 bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-2.5 min-w-[180px] max-w-[200px]">
                <div className="flex-shrink-0">
                  <span className="text-[#B7D31A]">{getIcon(b.icon, 22)}</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[#F7F6F7] font-semibold text-[10px] uppercase leading-tight">{b.title}</h4>
                  <p className="text-[#C7C7C0] text-[10px] font-medium mt-0.5 line-clamp-2">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tablet y Desktop: 4 columnas sin efecto */}
        <div className="hidden md:grid md:grid-cols-4 gap-0">
          {items.map((b, idx) => (
            <div key={b.id} className={'flex items-center gap-3 px-4 ' + (idx < items.length - 1 ? 'border-r border-white/15' : '')}>
              <div className="flex-shrink-0">
                <span className="text-[#B7D31A]">{getIcon(b.icon, 28)}</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[#F7F6F7] font-semibold text-[11px] uppercase leading-tight">{b.title}</h4>
                <p className="text-[#C7C7C0] text-[10px] font-medium mt-0.5 line-clamp-2">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}