import { Truck, CreditCard, RefreshCw, Lock } from 'lucide-react';

const BENEFITS = [
  {
    icon: <Truck size={26} strokeWidth={1.5} />,
    title: 'ENVÍOS RÁPIDOS',
    subtitle: 'A todo el país',
  },
  {
    icon: <CreditCard size={26} strokeWidth={1.5} />,
    title: 'HASTA 6 CUOTAS',
    subtitle: 'Sin interés',
  },
  {
    icon: <RefreshCw size={26} strokeWidth={1.5} />,
    title: 'CAMBIOS FÁCILES',
    subtitle: 'Hasta 15 días',
  },
  {
    icon: <Lock size={26} strokeWidth={1.5} />,
    title: 'COMPRA SEGURA',
    subtitle: 'Protegemos tus datos',
  },
];

export default function BenefitsStrip() {
  return (
    <section className="bg-[#1a1a1a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-6 py-5 ${
                i < BENEFITS.length - 1 ? 'border-b md:border-b-0 md:border-r border-white/10' : ''
              } ${i % 2 === 0 && i < BENEFITS.length - 1 ? 'md:border-r-0' : ''}`}
            >
              <div className="flex-none text-[#C8FF00]">{b.icon}</div>
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wide leading-snug">
                  {b.title}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
