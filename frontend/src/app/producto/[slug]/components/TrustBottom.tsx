import { Truck, RefreshCw, Shield, Check, MessageCircle } from 'lucide-react';

export default function TrustBottom() {
  return (
    <section className="border-t border-[#0D0F0F] py-10 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: <Truck size={22} />, title: 'ENVIOS A TODO EL PAIS', sub: 'Recibi tu pedido en cualquier punto del pais' },
            { icon: <RefreshCw size={22} />, title: '30 DIAS PARA CAMBIOS', sub: 'Si no estas conforme, podes cambiar tu producto' },
            { icon: <Shield size={22} />, title: 'GARANTIA OFICIAL', sub: 'Todos nuestros productos cuentan con garantia oficial' },
            { icon: <Check size={22} />, title: 'PAGOS 100% SEGUROS', sub: 'Protegemos tus datos con el mas alto nivel de seguridad' },
            { icon: <MessageCircle size={22} />, title: 'ATENCION PERSONALIZADA', sub: 'Te asesoramos por WhatsApp en todo momento' },
          ].map((t, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2 p-3">
              <span className="text-[#B7D31A]">{t.icon}</span>
              <p className="text-[#F7F6F7] font-semibold text-[11px] uppercase tracking-wide leading-snug">{t.title}</p>
              <p className="text-[#C7C7C0] text-[10px] leading-snug">{t.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}