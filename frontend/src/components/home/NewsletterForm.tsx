'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { FinalMessageData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Props {
  data: FinalMessageData | null;
}

export default function NewsletterForm({ data }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch(API_URL + '/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Te suscribiste correctamente!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al suscribirte');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexion');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const title = data?.newsletterTitle || 'ENTERATE DE LAS NOVEDADES';
  const text = data?.newsletterText || 'Ofertas exclusivas, nuevos productos y contenido relevante sobre padel.';
  const placeholder = data?.newsletterPlaceholder || 'Tu email';
  const footerText = data?.newsletterFooterText || 'Sin spam. Solo contenido relevante sobre padel.';

  return (
    <div className="bg-[#0C0C0C] border border-[#0D0F0F] rounded-2xl p-8 md:p-10 flex flex-col justify-between h-full">
      <div className="flex flex-col gap-5">
        <div className="w-12 h-12 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center">
          {status === 'success' ? <CheckCircle size={20} className="text-green-400" /> : <Mail size={20} className="text-[#B7D31A]" />}
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-[#F7F6F7] leading-tight">{title}</h2>
        {text && <p className="text-[#C7C7C0] text-sm leading-relaxed">{text}</p>}
      </div>
      <div className="flex flex-col gap-4 mt-6">
        <div className="w-10 h-0.5 bg-[#B7D31A] rounded-full" />

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
            <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 text-sm font-semibold">Suscrito!</p>
              <p className="text-green-400/70 text-xs">{email}</p>
            </div>
          </div>
        ) : (
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder={placeholder}
              required
              disabled={status === 'loading'}
              className="flex-1 bg-[#0A0F12] border border-[#0D0F0F] rounded-lg px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#B7D31A] text-[#050606] px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-[#CAE52E] transition-colors btn-primary-glow whitespace-nowrap disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><Loader2 size={14} className="animate-spin" /> ENVIANDO...</>
              ) : (
                'SUSCRIBIRME'
              )}
            </button>
          </form>
        )}

        {status === 'error' && <p className="text-red-400 text-xs">{message}</p>}
        {status !== 'success' && footerText && <p className="text-[#8A8A85] text-[10px]">{footerText}</p>}
      </div>
    </div>
  );
}
