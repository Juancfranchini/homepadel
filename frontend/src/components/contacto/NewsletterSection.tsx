'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Props {
  title: string;
  text: string;
}

export default function NewsletterSection({ title, text }: Props) {
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

  return (
    <section className="border-t border-[#0D0F0F] bg-[#080D11]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="bg-gradient-to-br from-[#0C0C0C] via-[#0F1417] to-[#0A0F12] border border-[#B7D31A]/20 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-6">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center">
                <Mail size={24} className="text-[#B7D31A]" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold text-[#F7F6F7] mb-1">{title}</h3>
              <p className="text-[#C7C7C0] text-sm">{text}</p>
            </div>
            <div className="w-full md:w-auto md:flex-1 max-w-md">
              {status === 'success' ? (
                <div className="flex items-center gap-3 text-[#B7D31A] bg-[#B7D31A]/5 border border-[#B7D31A]/20 rounded-xl px-4 py-3">
                  <Check size={20} />
                  <span className="text-sm font-semibold">{message}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                    placeholder="Tu email"
                    required
                    disabled={status === 'loading'}
                    className="flex-1 bg-[#11181D] border border-[#B7D31A]/30 rounded-xl px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all disabled:opacity-50"
                  />
                  <button type="submit" disabled={status === 'loading'} className="px-5 py-3 bg-[#B7D31A] text-[#050606] font-semibold text-sm uppercase tracking-wider rounded-xl hover:bg-[#CAE52E] transition-colors disabled:opacity-50 whitespace-nowrap">
                    {status === 'loading' ? 'ENVIANDO...' : 'SUSCRIBIRME'}
                  </button>
                </form>
              )}
              {status === 'error' && <p className="text-red-400 text-xs mt-2">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}