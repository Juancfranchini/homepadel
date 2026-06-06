import { Benefit } from '@/types';
import { Truck, CreditCard, RefreshCw, Shield, Package, Star, Lock, Zap } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Truck: <Truck size={32} strokeWidth={1.5} />,
  CreditCard: <CreditCard size={32} strokeWidth={1.5} />,
  RefreshCw: <RefreshCw size={32} strokeWidth={1.5} />,
  Lock: <Lock size={32} strokeWidth={1.5} />,
  Package: <Package size={32} strokeWidth={1.5} />,
  Star: <Star size={32} strokeWidth={1.5} />,
  Shield: <Shield size={32} strokeWidth={1.5} />,
  Zap: <Zap size={32} strokeWidth={1.5} />,
};

const FALLBACK_BENEFITS = [
  { id: '1', icon: 'Truck',      title: 'ENVÍO GRATIS',         description: 'A todo el país',      order: 1, active: true },
  { id: '2', icon: 'CreditCard', title: 'HASTA 9 CUOTAS',       description: 'Sin interés',          order: 2, active: true },
  { id: '3', icon: 'RefreshCw',  title: 'CAMBIOS SIN CARGO',    description: 'Hasta 30 días',        order: 3, active: true },
  { id: '4', icon: 'Shield',     title: 'PRODUCTOS ORIGINALES', description: 'Garantía oficial',     order: 4, active: true },
];

interface Props {
  benefits?: Benefit[];
}

export default function BenefitsStrip({ benefits }: Props) {
  const items = benefits && benefits.length > 0 ? benefits : FALLBACK_BENEFITS;

  return (
    <section className="bg-[#111] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.slice(0, 4).map((b, i) => (
            <div
              key={b.id}
              className={`flex items-center gap-4 px-6 py-7 ${
                i < 3 ? 'border-b md:border-b-0 md:border-r border-white/8' : ''
              }`}
            >
              {/* Ícono en círculo */}
              <div className="flex-none w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00]">
                {ICON_MAP[b.icon] ?? <Shield size={32} strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-white font-black text-[11px] uppercase tracking-widest leading-snug">
                  {b.title}
                </p>
                {b.description && (
                  <p className="text-gray-500 text-xs mt-0.5 leading-snug">{b.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
