import Link from 'next/link';
import {
  RefreshCw, Package, DollarSign, Shield,
  MessageCircle, Mail, Check, X, ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Política de Devolución | Home Pádel',
  description: 'Conocé nuestra política de cambios y devoluciones. Tenés 30 días para realizar cambios sin complicaciones.',
};

// ─── DATOS ────────────────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: <RefreshCw size={28} />, title: '30 DÍAS', desc: 'Tenés hasta 30 días corridos desde que recibís tu pedido.' },
  { icon: <Package size={28} />,   title: 'PRODUCTO SIN USO', desc: 'El producto debe estar sin uso, con etiquetas y en su embalaje original.' },
  { icon: <DollarSign size={28} />,title: 'CAMBIO O REINTEGRO', desc: 'Podés elegir entre cambio por otro producto o reintegro del dinero.' },
  { icon: <Shield size={28} />,    title: 'COMPRA SEGURA', desc: 'Proceso simple, rápido y 100% seguro.' },
];

const CONDITIONS_OK = [
  'El producto debe estar sin uso y en perfectas condiciones.',
  'Debe incluir su embalaje original, etiquetas, manuales y accesorios.',
  'La solicitud debe realizarse dentro de los 30 días corridos desde la recepción del pedido.',
  'El producto no debe presentar signos de uso, desgaste o daño.',
  'En caso de devolución por falla o error nuestro, nos hacemos cargo del envío.',
  'En caso de devolución por arrepentimiento, el costo del envío corre por cuenta del cliente.',
];

const CONDITIONS_NO = [
  'Productos usados o con signos de desgaste.',
  'Productos que no incluyan su embalaje original, etiquetas o accesorios.',
  'Productos en oferta o con descuento especial (salvo fallas de fábrica).',
  'Productos personalizados o a pedido.',
  'Productos que hayan sido alterados o modificados.',
  'Pelotas, grips, overgrips u otros accesorios que hayan sido abiertos.',
];

const STEPS = [
  { num: 1, title: 'CONTACTANOS', desc: 'Escribinos por WhatsApp, email o completá el formulario de contacto.' },
  { num: 2, title: 'PREPARÁ EL PRODUCTO', desc: 'Asegurate de que esté en su embalaje original y sin uso.' },
  { num: 3, title: 'ENVÍO DEL PRODUCTO', desc: 'Te indicaremos cómo y a dónde enviar el producto.' },
  { num: 4, title: 'REVISIÓN', desc: 'Una vez recibido, revisaremos el estado del producto.' },
  { num: 5, title: 'CAMBIO O REINTEGRO', desc: 'Procesamos el cambio o el reintegro según tu elección.' },
];

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function PoliticaDevolucionPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* ── BREADCRUMB ─────────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">Política de Devolución</span>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#D4FF00] text-xs font-black uppercase tracking-[0.2em] mb-3">DEVOLUCIONES Y CAMBIOS</p>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Política de Devolución
            </h1>
            <p className="text-[#A1A1AA] text-base leading-relaxed max-w-md">
              En Home Pádel queremos que estés 100% satisfecho con tu compra.
              Si por algún motivo no cumplimos tus expectativas, podés solicitar
              la devolución de tu producto dentro de los plazos establecidos.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-64 h-64 bg-[#121212] border border-white/[0.08] rounded-3xl flex items-center justify-center relative">
              {/* Caja con flecha de retorno ilustrativa */}
              <div className="relative">
                <div className="w-28 h-28 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl flex items-center justify-center">
                  <Package size={48} className="text-white/20" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#D4FF00] flex items-center justify-center">
                  <RefreshCw size={20} className="text-[#111]" />
                </div>
              </div>
              {/* Badge */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-xl px-3 py-2 text-center">
                <p className="text-[#D4FF00] font-black text-sm">30 DÍAS DE GARANTÍA</p>
                <p className="text-white/40 text-[10px]">Sin complicaciones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-[#121212] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 hover:border-[#D4FF00]/20 transition-colors">
                <span className="text-[#D4FF00]">{b.icon}</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wide">{b.title}</h3>
                <p className="text-[#A1A1AA] text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONDICIONES ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
            CONDICIONES PARA REALIZAR UNA DEVOLUCIÓN
          </h2>
          <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONDITIONS_OK.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                  <div className="w-5 h-5 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center flex-none mt-0.5">
                    <Check size={10} className="text-[#D4FF00]" />
                  </div>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PASOS ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-10">
            ¿CÓMO SOLICITAR UNA DEVOLUCIÓN?
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-0">
            {STEPS.map((step, i) => (
              <div key={i} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 flex-1 relative">
                {/* Conector */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-white/[0.08] z-0" />
                )}
                <div className="flex md:flex-col items-center gap-3 md:gap-2 w-full">
                  {/* Círculo */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-[#121212] border-2 border-white/[0.08] flex items-center justify-center flex-none">
                    <span className="text-white/30 text-lg">
                      {i === 0 && <MessageCircle size={20} />}
                      {i === 1 && <Package size={20} />}
                      {i === 2 && <ArrowRight size={20} />}
                      {i === 3 && <Shield size={20} />}
                      {i === 4 && <RefreshCw size={20} />}
                    </span>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D4FF00] flex items-center justify-center">
                      <span className="text-[#111] font-black text-[9px]">{step.num}</span>
                    </div>
                  </div>
                  {/* Texto */}
                  <div className="md:text-center pb-6 md:pb-0">
                    <p className="text-white font-black text-xs uppercase tracking-wide">{step.title}</p>
                    <p className="text-[#A1A1AA] text-[11px] leading-snug mt-1 max-w-[140px]">{step.desc}</p>
                  </div>
                </div>
                {/* Flecha mobile */}
                {i < STEPS.length - 1 && (
                  <div className="md:hidden w-px h-6 bg-white/[0.08] mx-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUÁNDO NO APLICA ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
            ¿CUÁNDO NO APLICA LA DEVOLUCIÓN?
          </h2>
          <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONDITIONS_NO.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-none mt-0.5">
                    <X size={10} className="text-red-400" />
                  </div>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AYUDA ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-none">
                <MessageCircle size={28} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">¿Necesitás ayuda?</h3>
                <p className="text-[#A1A1AA] text-sm mt-0.5">Nuestro equipo está listo para ayudarte con tu devolución.</p>
                <p className="text-white/40 text-xs mt-1">Lunes a Viernes de 9 a 18 hs. | Sábados de 9 a 13 hs.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href="https://wa.me/5491131813297"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-black text-sm rounded-xl hover:bg-green-400 transition-colors whitespace-nowrap"
              >
                <MessageCircle size={16} />
                ESCRIBINOS POR WHATSAPP
              </a>
              <a
                href="mailto:hola@homepadel.com.ar"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#121212] border border-white/20 text-white font-bold text-sm rounded-xl hover:border-white/40 transition-colors whitespace-nowrap"
              >
                <Mail size={16} />
                ENVIAR EMAIL
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { icon: <Package size={18} />, text: 'Producto en embalaje original' },
            { icon: <RefreshCw size={18} />, text: '30 días para cambios' },
            { icon: <Shield size={18} />, text: 'Garantía oficial' },
            { icon: <Check size={18} />, text: 'Proceso 100% seguro' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-[#A1A1AA]">
              <span className="text-[#D4FF00]">{t.icon}</span>
              <span className="text-xs font-semibold">{t.text}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
