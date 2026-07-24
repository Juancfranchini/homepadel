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
    try { await fetch(API_URL + '/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); } catch {}
    setSent(true); setSending(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/30 flex items-center justify-center"><Check size={28} className="text-[#B7D31A]" /></div>
        <h3 className="text-[#F7F6F7] font-semibold text-xl">Mensaje enviado!</h3>
        <p className="text-[#C7C7C0] text-sm max-w-xs">Gracias por contactarnos. Te respondemos en menos de 24 hs habiles.</p>
        <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="mt-2 text-[#B7D31A] text-sm font-semibold hover:opacity-80">Enviar otro mensaje</button>
      </div>
    );
  }

  const inputClass = "w-full bg-[#0A0F12] border border-[#0D0F0F] rounded-xl px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Nombre completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
      </div>
      <input type="tel" placeholder="Telefono (opcional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
      <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass + " appearance-none"}>
        <option value="">En que podemos ayudarte?</option>
        <option value="consulta-producto">Consulta sobre un producto</option>
        <option value="seguimiento-pedido">Seguimiento de pedido</option>
        <option value="cambio-devolucion">Cambio o devolucion</option>
        <option value="mayorista">Consulta mayorista</option>
        <option value="otro">Otro</option>
      </select>
      <textarea rows={5} placeholder="Tu mensaje" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + " resize-none"} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" disabled={sending} className="w-full py-3.5 rounded-xl bg-[#B7D31A] text-[#050606] font-semibold text-sm uppercase tracking-wider btn-primary-glow flex items-center justify-center gap-2 disabled:opacity-60">
        <Send size={15} />{sending ? 'Enviando...' : 'ENVIAR MENSAJE'}
      </button>
      <p className="text-center text-[#8A8A85] text-[10px] flex items-center justify-center gap-1">
        <Shield size={10} className="text-[#B7D31A]" />Tus datos estan protegidos.
      </p>
    </form>
  );
}