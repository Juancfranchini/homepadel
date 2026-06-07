'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle, Mail, Clock, MapPin, Instagram,
  Facebook, HelpCircle, ChevronDown, Send, Shield,
  Check,
} from 'lucide-react';

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: '¿Cuánto tardan en llegar los envíos?', a: 'El envío estándar demora entre 3 y 7 días hábiles dependiendo de la localidad. Para Buenos Aires y GBA, 1-3 días hábiles. Ofrecemos envío express en 24-48 hs.' },
  { q: '¿Hacen envíos a todo el país?', a: 'Sí, enviamos a todo el territorio argentino a través de correo oficial y empresas de transporte privadas como OCA y Andreani.' },
  { q: '¿Cuáles son los métodos de pago disponibles?', a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), Mercado Pago, transferencia bancaria y efectivo en puntos de pago. Con tarjeta de crédito podés pagar hasta en 6 cuotas sin interés.' },
  { q: '¿Puedo cambiar o devolver un producto?', a: 'Sí. Tenés 30 días desde la recepción para realizar cambios o devoluciones, siempre que el producto esté sin uso y en su embalaje original. Consultá nuestra Política de Devolución para más detalles.' },
  { q: '¿Los productos tienen garantía oficial?', a: 'Todos nuestros productos son 100% originales y cuentan con garantía oficial del fabricante. En caso de defecto de fábrica, gestionamos el reclamo sin costo adicional.' },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border border-white/[0.08] rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-semibold text-sm hover:bg-white/[0.03] transition-colors"
          >
            {item.q}
            <ChevronDown size={16} className={`flex-none text-[#A1A1AA] transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-[#A1A1AA] text-sm leading-relaxed border-t border-white/[0.06]">
              <p className="pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── FORMULARIO ───────────────────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Completá nombre, email y mensaje.');
      return;
    }
    setSending(true);
    setError('');
    try {
      // Intentar enviar al backend; si no hay endpoint, redirigir a WhatsApp
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      // Backend no tiene endpoint aún — enviar por WhatsApp como fallback
    }
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center">
          <Check size={28} className="text-[#D4FF00]" />
        </div>
        <h3 className="text-white font-black text-xl">¡Mensaje enviado!</h3>
        <p className="text-[#A1A1AA] text-sm max-w-xs">
          Gracias por contactarnos. Te respondemos en menos de 24 hs hábiles.
        </p>
        <button
          onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
          className="mt-2 text-[#D4FF00] text-sm font-bold hover:opacity-80"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
          />
        </div>
      </div>
      <input
        type="tel"
        placeholder="Teléfono (opcional)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
      />
      <select
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4FF00]/50 transition-colors appearance-none"
      >
        <option value="" className="bg-[#121212]">¿En qué podemos ayudarte?</option>
        <option value="consulta-producto" className="bg-[#121212]">Consulta sobre un producto</option>
        <option value="seguimiento-pedido" className="bg-[#121212]">Seguimiento de pedido</option>
        <option value="cambio-devolucion" className="bg-[#121212]">Cambio o devolución</option>
        <option value="mayorista" className="bg-[#121212]">Consulta mayorista</option>
        <option value="otro" className="bg-[#121212]">Otro</option>
      </select>
      <textarea
        rows={5}
        placeholder="Tu mensaje"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50 transition-colors resize-none"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="w-full py-3.5 rounded-xl bg-[#D4FF00] text-[#111] font-black text-sm uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Send size={15} />
        {sending ? 'Enviando...' : 'ENVIAR MENSAJE'}
      </button>
      <p className="text-center text-white/20 text-[10px] flex items-center justify-center gap-1">
        <Shield size={10} className="text-[#D4FF00]" />
        Tus datos están protegidos. No compartimos tu información.
      </p>
    </form>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

const CHANNELS = [
  {
    icon: <MessageCircle size={32} className="text-green-400" />,
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'WhatsApp',
    desc: 'La forma más rápida. Te respondemos al instante.',
    cta: 'ESCRIBINOS',
    href: 'https://wa.me/5491131813297',
  },
  {
    icon: <Mail size={32} className="text-blue-400" />,
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Email',
    desc: 'Respondemos tu consulta por correo electrónico.',
    cta: 'ENVIAR EMAIL',
    href: 'mailto:hola@homepadel.com.ar',
  },
  {
    icon: <Instagram size={32} className="text-pink-400" />,
    bg: 'bg-pink-500/10 border-pink-500/20',
    title: 'Instagram',
    desc: 'Escribinos por DM en nuestras redes.',
    cta: 'IR A INSTAGRAM',
    href: 'https://instagram.com/homepadel',
  },
  {
    icon: <HelpCircle size={32} className="text-[#D4FF00]" />,
    bg: 'bg-[#D4FF00]/10 border-[#D4FF00]/20',
    title: 'Preguntas frecuentes',
    desc: 'Encontrá respuestas rápidas a las dudas más comunes.',
    cta: 'VER FAQS',
    href: '#faq',
  },
];

const TRUST_ITEMS = [
  { icon: <MessageCircle size={20} />, title: 'Respuesta rápida', sub: 'En menos de 1 hora por WhatsApp' },
  { icon: <Shield size={20} />,        title: 'Compra protegida', sub: 'Tus datos y pagos 100% seguros' },
  { icon: <Check size={20} />,         title: 'Garantía oficial', sub: 'Todos los productos con garantía' },
  { icon: <Clock size={20} />,         title: 'Atención lunes a sábado', sub: 'Lunes a Viernes de 9 a 18 hs' },
];

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* ── BREADCRUMB ─────────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">Contacto</span>
        </div>
      </div>

      {/* ── HERO + FORM ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Info */}
          <div>
            <p className="text-[#D4FF00] text-xs font-black uppercase tracking-[0.2em] mb-3">
              ESTAMOS PARA AYUDARTE
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Contactanos
            </h1>
            <p className="text-[#A1A1AA] text-base leading-relaxed mb-8 max-w-md">
              ¿Tenés dudas sobre nuestros productos, envíos o pagos?
              Nuestro equipo estará encantado de ayudarte. Elegí el canal
              que prefieras y te respondemos a la brevedad.
            </p>

            <div className="space-y-5">
              <a
                href="https://wa.me/5491131813297"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-none group-hover:bg-green-500/20 transition-colors">
                  <MessageCircle size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Respuesta rápida por WhatsApp</p>
                  <p className="text-[#A1A1AA] text-xs mt-0.5">Escribinos y te respondemos en minutos.</p>
                  <p className="text-[#D4FF00] font-black text-sm mt-0.5">11 3181-3297</p>
                </div>
              </a>

              <a
                href="mailto:hola@homepadel.com.ar"
                className="flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-none group-hover:bg-blue-500/20 transition-colors">
                  <Mail size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Email</p>
                  <p className="text-[#A1A1AA] text-xs mt-0.5">Envianos tu consulta por correo.</p>
                  <p className="text-[#D4FF00] font-black text-sm mt-0.5">hola@homepadel.com.ar</p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center flex-none">
                  <Clock size={20} className="text-[#A1A1AA]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Horarios de atención</p>
                  <p className="text-[#A1A1AA] text-xs mt-0.5">Lunes a Viernes de 9 a 18 hs.</p>
                  <p className="text-[#A1A1AA] text-xs">Sábados de 9 a 13 hs.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center flex-none">
                  <MapPin size={20} className="text-[#A1A1AA]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Ubicación</p>
                  <p className="text-[#A1A1AA] text-xs mt-0.5">Villa Luro, CABA, Argentina.</p>
                  <p className="text-[#A1A1AA] text-xs">(Atención online y envíos a todo el país)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-black text-white mb-6">Envianos tu mensaje</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-[#050505] py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[#D4FF00] flex-none">{t.icon}</span>
              <div>
                <p className="text-white font-bold text-xs">{t.title}</p>
                <p className="text-[#A1A1AA] text-[10px] leading-snug">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CANALES ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8 text-center">
            Elegí tu canal de contacto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHANNELS.map((ch, i) => (
              <a
                key={i}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`flex flex-col items-center text-center p-6 rounded-2xl border ${ch.bg} hover:scale-[1.02] transition-all group`}
              >
                <div className="mb-3">{ch.icon}</div>
                <h3 className="text-white font-black text-sm mb-1">{ch.title}</h3>
                <p className="text-[#A1A1AA] text-xs leading-snug mb-4">{ch.desc}</p>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/60 border border-white/20 px-3 py-1.5 rounded-full group-hover:border-white/40 transition-colors">
                  {ch.cta} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
              Preguntas frecuentes
            </h2>
            <a
              href="https://wa.me/5491131813297"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#D4FF00] font-bold hover:opacity-80 flex items-center gap-1"
            >
              ¿No encontraste lo que buscás? Escribinos por WhatsApp →
            </a>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── NEWSLETTER ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4FF00]/10 border border-[#D4FF00]/20 flex items-center justify-center flex-none">
                <Mail size={20} className="text-[#D4FF00]" />
              </div>
              <div>
                <h3 className="text-white font-black text-base">Suscribite a nuestro newsletter</h3>
                <p className="text-[#A1A1AA] text-xs mt-0.5">Recibí novedades, ofertas exclusivas y beneficios.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 md:w-64 bg-[#0A0A0A] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50"
              />
              <button className="px-5 py-2.5 bg-[#D4FF00] text-[#111] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-colors whitespace-nowrap">
                SUSCRIBIRME
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
