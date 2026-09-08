'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Ingresá un email válido'),
});

type FormData = z.infer<typeof schema>;

export default function NewsletterSignupForm() {
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
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-full bg-[#B7D31A]/15 border border-[#B7D31A]/30 flex items-center justify-center text-[#B7D31A] flex-none">
          <Mail size={22} />
        </div>
        <p className="text-[#B7D31A] text-xs font-bold uppercase tracking-widest">
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
        <div className="flex items-center gap-3 text-[#B7D31A]">
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
              className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#B7D31A] transition-colors ${
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
            className="flex-none w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-3 bg-[#B7D31A] text-[#050606] rounded-lg font-black hover:bg-[#B7D31A] transition-colors disabled:opacity-70 flex items-center justify-center"
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
  );
}
