'use client';

import { useState } from 'react';
import { Send, Shield, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError('Completa nombre, email y mensaje.'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch(API_URL + '/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('request failed');
      setSent(true);
    } catch {
      // Antes esto se tragaba en silencio y igual mostraba "Mensaje
      // enviado!" — el usuario creía que se había mandado y en realidad no.
      setError('No pudimos enviar tu mensaje. Probá de nuevo en unos segundos.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/30 flex items-center justify-center"><Check size={28} className="text-brand-fg" /></div>
        <h3 className="text-fg font-semibold text-xl">Mensaje enviado!</h3>
        <p className="text-fg-soft text-sm max-w-xs">Gracias por contactarnos. Te respondemos en menos de 24 hs habiles.</p>
        <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="mt-2 text-brand-fg text-sm font-semibold hover:opacity-80">Enviar otro mensaje</button>
      </div>
    );
  }

  const inputClass = "w-full bg-night border border-line rounded-xl px-4 py-3 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all";
  const labelClass = "block text-xs font-medium text-fg-soft mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className={labelClass}>Nombre completo</label>
          <input id="contact-name" type="text" autoComplete="name" placeholder="Escribí tu nombre completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>Email</label>
          <input id="contact-email" type="email" autoComplete="email" placeholder="Escribí tu email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-phone" className={labelClass}>Teléfono (opcional)</label>
        <input id="contact-phone" type="tel" autoComplete="tel" placeholder="Escribí tu teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-subject" className={labelClass}>Asunto</label>
        <select id="contact-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass + " appearance-none"}>
          <option value="">Seleccioná el motivo de tu consulta</option>
          <option value="consulta-producto">Consulta sobre un producto</option>
          <option value="seguimiento-pedido">Seguimiento de pedido</option>
          <option value="cambio-devolución">Cambio o devolución</option>
          <option value="mayorista">Consulta mayorista</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className={labelClass}>Tu mensaje</label>
        <textarea id="contact-message" rows={5} placeholder="Escribí tu mensaje" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + " resize-none"} />
      </div>
      {error && <p className="text-red-400 light:text-red-700 text-xs">{error}</p>}
      <button type="submit" disabled={sending} className="w-full py-3.5 rounded-xl bg-[#B7D31A] text-[#050606] font-semibold text-sm uppercase tracking-wider btn-primary-glow flex items-center justify-center gap-2 disabled:opacity-60">
        <Send size={15} />{sending ? 'Enviando...' : 'ENVIAR MENSAJE'}
      </button>
      <p className="text-center text-fg-muted text-[10px] flex items-center justify-center gap-1">
        <Shield size={10} className="text-brand-fg" />Tus datos estan protegidos.
      </p>
    </form>
  );
}
