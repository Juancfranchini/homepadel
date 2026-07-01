import { Shield, Truck, RefreshCw } from 'lucide-react';

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#0D0F0F]">
      {[
        { icon: <Shield size={16} />, text: 'Garantia Oficial' },
        { icon: <Truck size={16} />, text: 'Envios a todo el pais' },
        { icon: <RefreshCw size={16} />, text: 'Cambios gratuitos' },
      ].map((t, i) => (
        <div key={i} className="flex flex-col items-center gap-1 text-center">
          <span className="text-[#B7D31A]">{t.icon}</span>
          <span className="text-[10px] text-[#C7C7C0] leading-snug">{t.text}</span>
        </div>
      ))}
    </div>
  );
}