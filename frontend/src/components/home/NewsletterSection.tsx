'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Mail, CheckCircle, MapPin, Shield, ShoppingBag, Star } from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Ingresá un email válido'),
});

type FormData = z.infer<typeof schema>;

const TRUST_BADGES = [
  {
    icon: <MapPin size={22} strokeWidth={1.5} />,
    title: 'Asesoramiento',
    subtitle: 'Personalizado',
  },
  {
    icon: <ShoppingBag size={22} strokeWidth={1.5} />,
    title: 'Productos 100%',
    subtitle: 'Originales',
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: 'Compra Segura',
    subtitle: 'Sitio protegido',
  },
  {
    icon: <Star size={22} strokeWidth={1.5} />,
    title: 'Experiencia',
    subtitle: 'Premium',
  },
];

export default function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 800));
    console.log('Newsletter:', data.email);
    setSubmitted(true);
  };

  return (
    <section className="bg-[#111]">
      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Columna izquierda — formulario */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-[#C8FF00]/15 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] flex-none">
                <Mail size={22} />
              </div>
              <p className="text-[#C8FF00] text-xs font-bold uppercase tracking-widest">
                Newsletter exclusivo
              </p>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-2">
              10% OFF en tu<br />primera compra
            </h2>
            <p className="text-gray-400 text-sm mb-7 leading-relaxed">
              Suscribite y recibí ofertas exclusivas y lanzamientos.
            </p>

            {submitted ? (
              <div className="flex items-center gap-3 text-[#C8FF00]">
                <CheckCircle size={24} />
                <div>
                  <p className="font-bold text-sm">¡Gracias por suscribirte!</p>
                  <p className="text-gray-400 text-xs mt-0.5">Revisá tu casilla para encontrar tu cupón.</p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col sm:flex-row gap-2 max-w-md"
                noValidate
              >
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Tu email"
                    {...register('email')}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#C8FF00] transition-colors ${
                      errors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.email && (
                    <p className="absolute -bottom-5 left-1 text-red-400 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-none w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-3 bg-[#C8FF00] text-[#111] rounded-lg font-black hover:bg-white transition-colors disabled:opacity-70 flex items-center justify-center"
                  aria-label="Suscribirse"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="sm:hidden" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="hidden sm:block text-sm uppercase tracking-wider">
                    {isSubmitting ? '...' : 'SUSCRIBIRME'}
                  </span>
                </button>
              </form>
            )}

            {!submitted && (
              <p className="text-gray-600 text-xs mt-7">
                No compartimos tu información.
              </p>
            )}
          </div>

          {/* Columna derecha — imagen decorativa */}
          <div className="hidden md:flex items-center justify-end">
            <div className="w-full max-w-sm h-64 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="text-center opacity-20">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="55" cy="42" rx="30" ry="35" fill="#2a2a2a" stroke="#C8FF00" strokeWidth="3"/>
                  <circle cx="45" cy="32" r="4" fill="#C8FF00" opacity="0.8"/>
                  <circle cx="60" cy="28" r="4" fill="#C8FF00" opacity="0.8"/>
                  <circle cx="68" cy="38" r="4" fill="#C8FF00" opacity="0.8"/>
                  <circle cx="48" cy="46" r="4" fill="#C8FF00" opacity="0.6"/>
                  <circle cx="63" cy="50" r="4" fill="#C8FF00" opacity="0.6"/>
                  <rect x="48" y="74" width="14" height="34" rx="7" fill="#C8FF00" opacity="0.9"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust badges ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-none w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00]">
                  {b.icon}
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-snug">{b.title}</p>
                  <p className="text-gray-500 text-xs">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
