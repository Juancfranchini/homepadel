import { MapPin, Shield, ShoppingBag, Star } from 'lucide-react';

const TRUST_BADGES = [
  {
    icon: <MapPin size={22} strokeWidth={1.5} />,
    title: 'Asesoramiento',
    subtitle: 'Personalizado',
  },
  {
    icon: <ShoppingBag size={22} strokeWidth={1.5} />,
    title: 'Productos 100%',
    subtitle: 'Originales',
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: 'Compra Segura',
    subtitle: 'Sitio protegido',
  },
  {
    icon: <Star size={22} strokeWidth={1.5} />,
    title: 'Experiencia',
    subtitle: 'Premium',
  },
];

export default function TrustBadgesRow() {
  return (
    <div className="border-t border-[#0D0F0F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_BADGES.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-none w-10 h-10 rounded-full bg-white/5 border border-[#0D0F0F] flex items-center justify-center text-[#B7D31A]">
                {b.icon}
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-snug">{b.title}</p>
                <p className="text-gray-500 text-xs">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
