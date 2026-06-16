'use client';

import { Mail } from 'lucide-react';

export default function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-[#0C0C0C] border border-[#0D0F0F] rounded-2xl p-8 md:p-10 flex flex-col justify-between h-full">
      <div className="flex flex-col gap-5">
        {/* Nivel 1: Icono */}
        <div className="w-12 h-12 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center">
          <Mail size={20} className="text-[#B7D31A]" />
        </div>

        {/* Nivel 2: Titulo - mismo peso y tamano que h2 */}
        <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-[#F7F6F7] leading-tight">
          ENTERATE DE LAS NOVEDADES
        </h2>

        {/* Nivel 3: Texto descriptivo */}
        <p className="text-[#C7C7C0] text-sm leading-relaxed">
          Ofertas exclusivas, nuevos productos y contenido relevante sobre padel.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {/* Nivel 4: Separador */}
        <div className="w-10 h-0.5 bg-[#B7D31A] rounded-full" />

        {/* Nivel 5: Input + Boton */}
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Tu email"
            className="flex-1 bg-[#0A0F12] border border-[#0D0F0F] rounded-lg px-4 py-3 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all"
          />
          <button
            type="submit"
            className="bg-[#B7D31A] text-[#050606] px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-[#CAE52E] transition-colors btn-primary-glow whitespace-nowrap"
          >
            SUSCRIBIRME
          </button>
        </form>

        {/* Nivel 6: Texto small */}
        <p className="text-[#8A8A85] text-[10px]">
          Sin spam. Solo contenido relevante sobre padel.
        </p>
      </div>
    </div>
  );
}