'use client';

import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { FinalMessageData } from '@/types';
import { useNewsletterForm } from './useNewsletterForm';

interface Props {
  data: FinalMessageData | null;
}

export default function NewsletterForm({ data }: Props) {
  const { email, status, message, handleSubmit, onEmailChange } = useNewsletterForm();

  const title = data?.newsletterTitle || 'ENTERATE DE LAS NOVEDADES';
  const text = data?.newsletterText || 'Ofertas exclusivas, nuevos productos y contenido relevante sobre padel.';
  const configuredPlaceholder = data?.newsletterPlaceholder?.trim();
  const placeholder = configuredPlaceholder && configuredPlaceholder !== 'Tu email'
    ? configuredPlaceholder
    : 'Escribí tu email';
  const footerText = data?.newsletterFooterText || 'Sin spam. Solo contenido relevante sobre padel.';

  return (
    <div className="bg-panel border border-line rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 flex flex-col justify-between h-full">
      <div className="flex flex-col gap-3 sm:gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center flex-shrink-0">
            {status === 'success' ? <CheckCircle size={20} className="text-green-400 light:text-green-700" /> : <Mail size={20} className="text-brand-fg" />}
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold uppercase tracking-tight text-fg leading-tight">{title}</h2>
        </div>
        {text && <p className="text-fg-soft text-xs sm:text-sm leading-relaxed">{text}</p>}
      </div>
      <div className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-6">
        <div className="w-8 sm:w-10 h-0.5 bg-[#B7D31A] rounded-full" />

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
            <CheckCircle size={18} className="text-green-400 light:text-green-700 flex-shrink-0" />
            <div>
              <p className="text-green-400 light:text-green-700 text-sm font-semibold">Suscrito!</p>
              <p className="text-green-400/70 light:text-green-700/70 text-xs">{email}</p>
            </div>
          </div>
        ) : (
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
            <input
              type="email"
              autoComplete="email"
              aria-label="Email para suscribirte"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={placeholder}
              required
              disabled={status === 'loading'}
              className="flex-1 bg-night border border-[#B7D31A]/40 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/30 text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#B7D31A] text-[#050606] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#CAE52E] transition-colors btn-primary-glow whitespace-nowrap disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {status === 'loading' ? (
                <><Loader2 size={14} className="animate-spin" /> ENVIANDO...</>
              ) : (
                'SUSCRIBIRME'
              )}
            </button>
          </form>
        )}

        {status === 'error' && <p className="text-red-400 light:text-red-700 text-xs">{message}</p>}
        {status !== 'success' && footerText && <p className="text-fg-muted text-[10px]">{footerText}</p>}
      </div>
    </div>
  );
}
