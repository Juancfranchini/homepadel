'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Clock, MapPin, Send, Shield, Check } from 'lucide-react';

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Completa nombre, email y mensaje.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api') + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/30 flex items-center justify-center">
          <Check size={28} className="text-[#B7D31A]" />
        </div>
        <h3 className="text-[#F7F6F7] font-semibold text-xl">Mensaje enviado!</h3>
        <p className="text-[#C7C7C0] text-sm max-w-xs">Gracias por contactarnos. Te respondemos en menos de 24 hs habiles.</p>
        <button
          onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
          className="mt-2 text-[#B7D31A] text-sm font-semibold hover:opacity-80"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text" placeholder="Nombre completo"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all"
        />
        <input
          type="email" placeholder="Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all"
        />
      </div>
      <input
        type="tel" placeholder="Telefono (opcional)"
        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all"
      />
      <select
        value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
        className="w-full bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-3 text-sm text-[#F7F6F7] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all appearance-none"
      >
        <option value="" className="bg-[#0C0C0C]">En que podemos ayudarte?</option>
        <option value="consulta-producto" className="bg-[#0C0C0C]">Consulta sobre un producto</option>
        <option value="seguimiento-pedido" className="bg-[#0C0C0C]">Seguimiento de pedido</option>
        <option value="cambio-devolucion" className="bg-[#0C0C0C]">Cambio o devolucion</option>
        <option value="mayorista" className="bg-[#0C0C0C]">Consulta mayorista</option>
        <option value="otro" className="bg-[#0C0C0C]">Otro</option>
      </select>
      <textarea
        rows={5} placeholder="Tu mensaje"
        value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all resize-none"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit" disabled={sending}
        className="w-full py-3.5 rounded-xl bg-[#B7D31A] text-[#050606] font-semibold text-sm uppercase tracking-wider btn-primary-glow flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Send size={15} />
        {sending ? 'Enviando...' : 'ENVIAR MENSAJE'}
      </button>
      <p className="text-center text-[#8A8A85] text-[10px] flex items-center justify-center gap-1">
        <Shield size={10} className="text-[#B7D31A]" />
        Tus datos estan protegidos. No compartimos tu informacion.
      </p>
    </form>
  );
}

const CONTACT_INFO = [
  { icon: <MessageCircle size={20} className="text-green-400" />, bg: 'bg-green-500/10 border-green-500/20', title: 'WhatsApp', desc: 'La forma mas rapida. Te respondemos al instante.', detail: '11 3181-3297', href: 'https://wa.me/5491131813297' },
  { icon: <Mail size={20} className="text-[#B7D31A]" />, bg: 'bg-[#B7D31A]/10 border-[#B7D31A]/20', title: 'Email', desc: 'Respondemos tu consulta por correo.', detail: 'hola@homepadel.com.ar', href: 'mailto:hola@homepadel.com.ar' },
  { icon: <Clock size={20} className="text-[#8A8A85]" />, bg: 'bg-white/5 border-[#0D0F0F]', title: 'Horarios', desc: 'Lunes a Viernes de 9 a 18 hs.', detail: 'Sabados de 9 a 13 hs.', href: null },
  { icon: <MapPin size={20} className="text-[#8A8A85]" />, bg: 'bg-white/5 border-[#0D0F0F]', title: 'Ubicacion', desc: 'Villa Luro, CABA, Argentina.', detail: 'Envios a todo el pais', href: null },
];

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C0C0C] to-[#050606] text-[#F7F6F7]">

      {/* BREADCRUMB */}
      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#F7F6F7]">Contacto</span>
        </div>
      </div>

      {/* HERO + FORM */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Info */}
          <div>
            <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">ESTAMOS PARA AYUDARTE</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">Contactanos</h1>
            <p className="text-[#C7C7C0] text-base leading-relaxed mb-8">
              Tenes dudas sobre nuestros productos, envios o pagos? Nuestro equipo esta para ayudarte.
            </p>

            <div className="space-y-5">
              {CONTACT_INFO.map((item, i) => (
                item.href ? (
                  <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                    <div className={'w-11 h-11 rounded-xl border flex items-center justify-center flex-none group-hover:scale-105 transition-transform ' + item.bg}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[#F7F6F7] font-semibold text-sm">{item.title}</p>
                      <p className="text-[#C7C7C0] text-xs mt-0.5">{item.desc}</p>
                      <p className="text-[#B7D31A] font-semibold text-sm mt-0.5">{item.detail}</p>
                    </div>
                  </a>
                ) : (
                  <div key={i} className="flex items-start gap-4">
                    <div className={'w-11 h-11 rounded-xl border flex items-center justify-center flex-none ' + item.bg}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[#F7F6F7] font-semibold text-sm">{item.title}</p>
                      <p className="text-[#C7C7C0] text-xs mt-0.5">{item.desc}</p>
                      <p className="text-[#C7C7C0] text-xs">{item.detail}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#F7F6F7] mb-6">Envianos tu mensaje</h2>
            <ContactForm />
          </div>
        </div>
      </section>

    </div>
  );
}