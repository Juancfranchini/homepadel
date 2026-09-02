import { Truck, CreditCard, RefreshCw, Shield, Lock, Package, Sparkles, Heart, Star, Check } from 'lucide-react';
import { Benefit } from '@/types';

interface Props {
  benefits: Benefit[];
}

const FALLBACK = [
  { id: '1', title: 'ENVIO GRATIS', description: 'A todo el pais', icon: 'truck' },
  { id: '2', title: 'HASTA 9 CUOTAS', description: 'Sin interes', icon: 'credit-card' },
  { id: '3', title: 'CAMBIOS SIN CARGO', description: '30 días de garantía', icon: 'refresh-cw' },
  { id: '4', title: 'PRODUCTOS ORIGINALES', description: 'Calidad asegurada', icon: 'shield' },
];

function getIcon(iconName: string): React.ReactNode {
  if (!iconName) return <Truck size={36} />;
  const icons: Record<string, React.ReactNode> = {
    'Truck': <Truck size={36} />,
    'truck': <Truck size={36} />,
    'CreditCard': <CreditCard size={36} />,
    'credit-card': <CreditCard size={36} />,
    'creditcard': <CreditCard size={36} />,
    'RefreshCw': <RefreshCw size={36} />,
    'refresh-cw': <RefreshCw size={36} />,
    'refreshcw': <RefreshCw size={36} />,
    'Shield': <Shield size={36} />,
    'shield': <Shield size={36} />,
    'Lock': <Lock size={36} />,
    'lock': <Lock size={36} />,
    'Package': <Package size={36} />,
    'package': <Package size={36} />,
    'Sparkles': <Sparkles size={36} />,
    'sparkles': <Sparkles size={36} />,
    'Heart': <Heart size={36} />,
    'heart': <Heart size={36} />,
    'Star': <Star size={36} />,
    'star': <Star size={36} />,
    'Check': <Check size={36} />,
    'check': <Check size={36} />,
  };
  return icons[iconName] || <Truck size={36} />;
}

export default function BenefitsStrip({ benefits }: Props) {
  const items = benefits && benefits.length > 0 ? benefits : FALLBACK;

  return (
    <section className="bg-[#050606] border-t border-b border-[#0D0F0F] py-3 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: 4 columnas */}
        <div className="hidden md:grid md:grid-cols-4 gap-0">
          {items.map((b) => (
            <div key={b.id} className="flex items-center gap-4 border-r border-white/20 last:border-r-0 px-6 first:pl-0 last:pr-0">
              <div className="flex-shrink-0 w-[40%] flex justify-center">
                <span className="text-[#B7D31A]">
                  {getIcon(b.icon)}
                </span>
              </div>
              <div className="flex-1 w-[60%]">
                <h4 className="text-[#F7F6F7] font-semibold text-sm uppercase leading-tight">{b.title}</h4>
                <p className="text-[#C7C7C0] text-sm font-medium mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: scroll horizontal */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-4 min-w-max">
            {items.map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-3 min-w-[180px] max-w-[200px]">
                <div className="flex-shrink-0">
                  <span className="text-[#B7D31A]">
                    {getIcon(b.icon)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[#F7F6F7] font-semibold text-[11px] uppercase leading-tight">{b.title}</h4>
                  <p className="text-[#C7C7C0] text-[11px] font-medium mt-0.5 line-clamp-2">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}