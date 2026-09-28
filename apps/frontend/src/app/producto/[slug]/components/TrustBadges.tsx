import { Shield, Truck, RefreshCw } from 'lucide-react';

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2 sm:py-3 border-y border-line">
      {[
        { icon: <Shield size={16} />, title: 'Garantía Oficial' },
        { icon: <Truck size={16} />, title: 'Envíos a todo el pais' },
        { icon: <RefreshCw size={16} />, title: 'Cambios gratuitos' },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-1 sm:gap-2">
          <span className="text-brand-fg flex-shrink-0">{t.icon}</span>
          <p className="text-fg font-semibold text-[9px] sm:text-xs leading-tight whitespace-nowrap">{t.title}</p>
        </div>
      ))}
    </div>
  );
}