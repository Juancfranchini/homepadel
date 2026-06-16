import { Truck, CreditCard, RefreshCw, Shield } from 'lucide-react';
import { Benefit } from '@/types';

interface Props {
  benefits: Benefit[];
}

const FALLBACK = [
  { id: '1', title: 'ENVIO GRATIS', description: 'A todo el pais', icon: 'truck' },
  { id: '2', title: 'HASTA 9 CUOTAS', description: 'Sin interes', icon: 'credit-card' },
  { id: '3', title: 'CAMBIOS SIN CARGO', description: '30 dias de garantia', icon: 'refresh-cw' },
  { id: '4', title: 'PRODUCTOS ORIGINALES', description: 'Calidad asegurada', icon: 'shield' },
];

const ICONS: Record<string, React.ReactNode> = {
  truck: <Truck size={36} />,
  'credit-card': <CreditCard size={36} />,
  'refresh-cw': <RefreshCw size={36} />,
  shield: <Shield size={36} />,
};

export default function BenefitsStrip({ benefits }: Props) {
  const items = benefits && benefits.length > 0 ? benefits : FALLBACK;

  return (
    <section className="bg-[#050606] border-t border-b border-[#0D0F0F] py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Desktop: 4 columnas */}
        <div className="hidden md:grid md:grid-cols-4 gap-0">
          {items.map((b) => (
            <div key={b.id} className="flex items-center gap-4 border-r border-white/20 last:border-r-0 px-6 first:pl-0 last:pr-0">
              <div className="flex-shrink-0 w-[40%] flex justify-center">
                <span className="text-[#B7D31A]">
                  {ICONS[b.icon] || <Truck size={36} />}
                </span>
              </div>
              <div className="flex-1 w-[60%]">
                <h4 className="text-[#F7F6F7] font-semibold text-sm uppercase leading-tight">{b.title}</h4>
                <p className="text-[#C7C7C0] text-sm font-medium mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: 2 filas x 2 columnas */}
        <div className="md:hidden grid grid-cols-2 gap-6">
          {items.slice(0, 2).map((b) => (
            <div key={b.id} className="flex flex-col items-center text-center gap-2">
              <span className="text-[#B7D31A]">
                {ICONS[b.icon] || <Truck size={36} />}
              </span>
              <div>
                <h4 className="text-[#F7F6F7] font-semibold text-xs uppercase leading-tight">{b.title}</h4>
                <p className="text-[#C7C7C0] text-xs font-medium mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
          {items.slice(2, 4).map((b) => (
            <div key={b.id} className="flex flex-col items-center text-center gap-2">
              <span className="text-[#B7D31A]">
                {ICONS[b.icon] || <Truck size={36} />}
              </span>
              <div>
                <h4 className="text-[#F7F6F7] font-semibold text-xs uppercase leading-tight">{b.title}</h4>
                <p className="text-[#C7C7C0] text-xs font-medium mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}