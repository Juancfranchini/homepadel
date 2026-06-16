import Link from 'next/link';
import { Shield, CreditCard, Smartphone, Building2, Check } from 'lucide-react';

export const metadata = {
  title: 'Medios de Pago | Home Pádel',
  description: 'Conocé todos los medios de pago disponibles: tarjetas de crédito, débito, Mercado Pago y transferencia.',
};

const CUOTAS = [
  { cuotas: '1 cuota', desc: 'Precio de lista, sin recargo' },
  { cuotas: '3 cuotas', desc: 'Sin interés (VISA, MC, AMEX)' },
  { cuotas: '6 cuotas', desc: 'Sin interés (VISA, MC, AMEX)' },
  { cuotas: '12 cuotas', desc: 'Con interés del banco' },
  { cuotas: '18 cuotas', desc: 'Con interés del banco' },
];

const TARJETAS = ['VISA', 'MASTERCARD', 'AMERICAN EXPRESS', 'NARANJA', 'CABAL', 'CMR'];

export default function MediosDePagoPage() {
  return (
    <div className="min-h-screen bg-[#050606] text-white">

      {/* BREADCRUMB */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">Medios de Pago</span>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 text-center">
        <p className="text-[#B7D31A] text-xs font-black uppercase tracking-[0.2em] mb-3">PAGOS</p>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
          Medios de Pago
        </h1>
        <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl mx-auto">
          Aceptamos múltiples formas de pago para que tu compra sea lo más cómoda posible.
          Hasta 6 cuotas sin interés con las principales tarjetas.
        </p>
      </section>

      {/* OPCIONES */}
      <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Tarjetas de crédito */}
            <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 hover:border-[#B7D31A]/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] mb-4">
                <CreditCard size={20} />
              </div>
              <h3 className="text-white font-black text-base mb-2">Tarjeta de Crédito</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">
                Pagá con tus tarjetas de crédito favoritas. Hasta 6 cuotas sin interés disponibles.
              </p>
              <div className="flex flex-wrap gap-2">
                {['VISA', 'MC', 'AMEX', 'NARANJA'].map((card) => (
                  <span key={card} className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">
                    {card}
                  </span>
                ))}
              </div>
            </div>

            {/* Tarjetas de débito */}
            <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 hover:border-[#B7D31A]/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] mb-4">
                <CreditCard size={20} />
              </div>
              <h3 className="text-white font-black text-base mb-2">Tarjeta de Débito</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">
                Pagá directamente desde tu cuenta bancaria. Sin recargo, precio de lista.
              </p>
              <div className="flex flex-wrap gap-2">
                {['VISA DÉBITO', 'MAESTRO', 'CABAL'].map((card) => (
                  <span key={card} className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">
                    {card}
                  </span>
                ))}
              </div>
            </div>

            {/* Mercado Pago */}
            <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 hover:border-[#B7D31A]/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] mb-4">
                <Smartphone size={20} />
              </div>
              <h3 className="text-white font-black text-base mb-2">Mercado Pago</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">
                Pagá con tu saldo de Mercado Pago, tarjetas o desde la app. Rápido y seguro.
              </p>
              <span className="bg-[#B7D31A]/10 text-[#B7D31A] text-[10px] font-bold px-2 py-1 rounded border border-[#B7D31A]/20">
                MERCADO PAGO
              </span>
            </div>

            {/* Transferencia bancaria */}
            <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 hover:border-[#B7D31A]/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] mb-4">
                <Building2 size={20} />
              </div>
              <h3 className="text-white font-black text-base mb-2">Transferencia Bancaria / CBU</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Transferí directamente a nuestra cuenta. El pedido se procesa una vez acreditado el pago
                (generalmente en 24 hs hábiles).
              </p>
            </div>

            {/* QR */}
            <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 hover:border-[#B7D31A]/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] mb-4">
                <Smartphone size={20} />
              </div>
              <h3 className="text-white font-black text-base mb-2">Pago con QR</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                En nuestro local podés pagar escaneando el código QR con cualquier billetera virtual
                (Mercado Pago, Ualá, Naranja X, etc).
              </p>
            </div>

            {/* Seguridad */}
            <div className="bg-[#0C0C0C] border border-[#B7D31A]/20 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center text-[#B7D31A] mb-4">
                <Shield size={20} />
              </div>
              <h3 className="text-white font-black text-base mb-2">Compra 100% Segura</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Todas las transacciones están protegidas con certificado SSL y procesadas por
                plataformas de pago certificadas y auditadas.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CUOTAS */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
            PLAN DE CUOTAS
          </h2>
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl overflow-hidden">
            {CUOTAS.map((c, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-4 ${i < CUOTAS.length - 1 ? 'border-b border-white/[0.06]' : ''} ${i < 3 ? 'bg-[#B7D31A]/[0.02]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none ${i < 3 ? 'bg-[#B7D31A]/10 border border-[#B7D31A]/30' : 'bg-white/5 border border-white/10'}`}>
                    <Check size={10} className={i < 3 ? 'text-[#B7D31A]' : 'text-white/30'} />
                  </div>
                  <span className="text-white font-bold text-sm">{c.cuotas}</span>
                </div>
                <span className={`text-sm font-semibold ${i < 3 ? 'text-[#B7D31A]' : 'text-[#A1A1AA]'}`}>
                  {c.desc}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[#A1A1AA] text-xs mt-4">
            * Las cuotas sin interés aplican con VISA, Mastercard y American Express. Las cuotas con interés dependen del banco emisor.
            Las promociones pueden variar según la temporada.
          </p>
        </div>
      </section>

    </div>
  );
}
