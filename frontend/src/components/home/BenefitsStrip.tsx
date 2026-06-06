import { Benefit } from '@/types';
import { Truck, CreditCard, RefreshCw, Lock, Package, Star, Shield, Zap } from 'lucide-react';

// Mapa de iconos disponibles (nombre → componente Lucide)
const ICON_MAP: Record<string, React.ReactNode> = {
  Truck: <Truck size={26} strokeWidth={1.5} />,
  CreditCard: <CreditCard size={26} strokeWidth={1.5} />,
  RefreshCw: <RefreshCw size={26} strokeWidth={1.5} />,
  Lock: <Lock size={26} strokeWidth={1.5} />,
  Package: <Package size={26} strokeWidth={1.5} />,
  Star: <Star size={26} strokeWidth={1.5} />,
  Shield: <Shield size={26} strokeWidth={1.5} />,
  Zap: <Zap size={26} strokeWidth={1.5} />,
};

const FALLBACK_BENEFITS = [
  { id: '1', icon: 'Truck', title: 'ENVÍOS RÁPIDOS', description: 'A todo el país', order: 1, active: true },
  { id: '2', icon: 'CreditCard', title: 'HASTA 9 CUOTAS', description: 'Sin interés', order: 2, active: true },
  { id: '3', icon: 'RefreshCw', title: 'CAMBIOS FÁCILES', description: 'Hasta 30 días', order: 3, active: true },
  { id: '4', icon: 'Lock', title: 'COMPRA SEGURA', description: 'Protegemos tus datos', order: 4, active: true },
];

interface Props {
  benefits?: Benefit[];
}

export default function BenefitsStrip({ benefits }: Props) {
  const items = benefits && benefits.length > 0 ? benefits : FALLBACK_BENEFITS;

  return (
    <section className="bg-[#1a1a1a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.slice(0, 8).map((b, i) => (
            <div
              key={b.id}
              className={`flex items-center gap-3 px-6 py-5 ${
                i < items.length - 1 ? 'border-b md:border-b-0 md:border-r border-white/10' : ''
              }`}
            >
              <div className="flex-none text-[#C8FF00]">
                {ICON_MAP[b.icon] ?? <Shield size={26} strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wide leading-snug">
                  {b.title}
                </p>
                {b.description && (
                  <p className="text-gray-500 text-xs mt-0.5">{b.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
