import { Shield, Truck, RefreshCw } from 'lucide-react';

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#0D0F0F]">
      {[
        { icon: <Shield size={16} />, title: 'Garantia Oficial' },
        { icon: <Truck size={16} />, title: 'Envios a todo el pais' },
        { icon: <RefreshCw size={16} />, title: 'Cambios gratuitos' },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[#B7D31A] flex-shrink-0">{t.icon}</span>
          <p className="text-[#F7F6F7] font-semibold text-xs">{t.title}</p>
        </div>
      ))}
    </div>
  );
}