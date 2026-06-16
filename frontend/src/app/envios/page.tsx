import Link from 'next/link';
import { Truck, Clock, MapPin, Package, MessageCircle, Check } from 'lucide-react';

export const metadata = {
  title: 'Envíos | Home Pádel',
  description: 'Información sobre nuestros tiempos y costos de envío a todo el país.',
};

const ZONAS = [
  {
    zona: 'CABA y GBA',
    tiempo: '1 a 3 días hábiles',
    costo: 'Desde $2.500',
    gratis: 'Gratis en pedidos +$100.000',
    destacado: true,
  },
  {
    zona: 'Buenos Aires Interior',
    tiempo: '3 a 5 días hábiles',
    costo: 'Desde $3.500',
    gratis: 'Gratis en pedidos +$150.000',
    destacado: false,
  },
  {
    zona: 'Centro del País',
    tiempo: '4 a 6 días hábiles',
    costo: 'Desde $4.500',
    gratis: 'Gratis en pedidos +$150.000',
    destacado: false,
  },
  {
    zona: 'Norte y Cuyo',
    tiempo: '5 a 7 días hábiles',
    costo: 'Desde $5.500',
    gratis: 'Consultar',
    destacado: false,
  },
  {
    zona: 'Patagonia',
    tiempo: '6 a 10 días hábiles',
    costo: 'Desde $6.500',
    gratis: 'Consultar',
    destacado: false,
  },
];

const STEPS = [
  { icon: <Package size={22} />, title: 'Confirmamos tu pedido', desc: 'Una vez acreditado el pago, preparamos tu pedido.' },
  { icon: <Truck size={22} />, title: 'Despachamos', desc: 'Tu pedido sale de nuestro depósito y recibís el número de seguimiento.' },
  { icon: <MapPin size={22} />, title: 'En camino', desc: 'Podés rastrear tu envío en tiempo real con el código que te enviamos.' },
  { icon: <Check size={22} />, title: 'Entrega', desc: 'Recibís tu pedido en la dirección que indicaste.' },
];

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-[#050606] text-white">

      {/* BREADCRUMB */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">Envíos</span>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div>
            <p className="text-[#B7D31A] text-xs font-black uppercase tracking-[0.2em] mb-3">LOGÍSTICA</p>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Información de Envíos
            </h1>
            <p className="text-[#A1A1AA] text-base leading-relaxed max-w-lg">
              Enviamos a todo el país con los operadores logísticos más confiables.
              Seguí tu pedido en tiempo real desde que sale de nuestro depósito.
            </p>
          </div>
          <div className="flex gap-4 flex-none">
            <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-5 text-center w-32">
              <Truck size={28} className="text-[#B7D31A] mx-auto mb-2" />
              <p className="text-white font-black text-sm">ENVÍO A</p>
              <p className="text-[#B7D31A] font-black text-lg">TODO EL PAÍS</p>
            </div>
            <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-5 text-center w-32">
              <Clock size={28} className="text-[#B7D31A] mx-auto mb-2" />
              <p className="text-white font-black text-sm">DESDE</p>
              <p className="text-[#B7D31A] font-black text-lg">24 HS</p>
            </div>
          </div>
        </div>
      </section>

      {/* ZONAS */}
      <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
            TIEMPOS Y COSTOS POR ZONA
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] pb-3 pr-4">Zona</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] pb-3 pr-4">Tiempo estimado</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] pb-3 pr-4">Costo</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] pb-3">Envío gratis</th>
                </tr>
              </thead>
              <tbody>
                {ZONAS.map((z, i) => (
                  <tr
                    key={i}
                    className={`border-b border-white/[0.06] ${z.destacado ? 'bg-[#B7D31A]/[0.04]' : ''}`}
                  >
                    <td className="py-4 pr-4">
                      <span className={`font-bold text-sm ${z.destacado ? 'text-[#B7D31A]' : 'text-white'}`}>
                        {z.zona}
                        {z.destacado && (
                          <span className="ml-2 bg-[#B7D31A]/20 text-[#B7D31A] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            Express
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-[#A1A1AA] text-sm">{z.tiempo}</td>
                    <td className="py-4 pr-4 text-white text-sm font-semibold">{z.costo}</td>
                    <td className="py-4 text-[#B7D31A] text-xs font-semibold">{z.gratis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[#A1A1AA] text-xs mt-4">
            * Los tiempos son estimativos y pueden variar según la disponibilidad del operador logístico y la temporada.
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-10">
            ¿CÓMO FUNCIONA EL ENVÍO?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] mb-4">
                  {step.icon}
                </div>
                <p className="text-white font-black text-sm mb-1">{step.title}</p>
                <p className="text-[#A1A1AA] text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RETIRO EN LOCAL */}
      <section className="border-t border-white/[0.06] py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] flex-none">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-white font-black text-lg mb-1">Retiro en local — SIN COSTO</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Podés retirar tu pedido en nuestro local sin costo adicional.
                Una vez que el pedido esté listo (generalmente en 24 hs hábiles), te avisamos por email y WhatsApp.
              </p>
              <p className="text-white/40 text-xs mt-2">Lunes a Viernes de 10 a 18 hs | Sábados de 10 a 14 hs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#A1A1AA] text-sm mb-4">¿Tenés dudas sobre tu envío?</p>
          <a
            href="https://wa.me/5491131813297"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-black text-sm rounded-xl hover:bg-green-400 transition-colors"
          >
            <MessageCircle size={16} />
            Consultanos por WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
