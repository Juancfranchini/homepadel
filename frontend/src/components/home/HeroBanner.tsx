import Link from 'next/link';
import { Banner } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  banner?: Banner;
}

export default function HeroBanner({ banner }: Props) {
  // Título: split por \n — última línea en lima, el resto en blanco
  const rawTitle = banner?.title || 'EQUIPAMIENTO\nDE ALTO\nRENDIMIENTO';
  const titleLines = rawTitle.split(/\\n|\n/);
  const limeLine = titleLines[titleLines.length - 1];
  const whiteLines = titleLines.slice(0, -1);

  const description =
    banner?.subtitle ||
    'Productos seleccionados para jugadores exigentes que buscan llevar su juego al siguiente nivel.';

  const heroImage = banner?.image ? getImageUrl(banner.image) : null;

  return (
    <section className="relative w-full bg-[#111] overflow-hidden min-h-[580px] md:min-h-[640px] flex items-center">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#111] to-[#1a1a1a]" />

      {/* Si hay imagen, se pone como capa de fondo a la derecha en mobile */}
      {heroImage && (
        <div
          className="absolute inset-0 md:hidden opacity-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* ── Columna izquierda — Texto ──────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Tag temporada */}
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8l5-5 7 7" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#C8FF00] text-xs font-bold uppercase tracking-[0.25em]">
                Nueva Temporada 2025
              </span>
            </div>

            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-none tracking-tight uppercase">
              {whiteLines.map((line, i) => (
                <span key={i} className="text-white block">{line}</span>
              ))}
              <span className="text-[#C8FF00] block">{limeLine}</span>
            </h1>

            {/* Descripción */}
            <p className="text-gray-400 text-sm md:text-base max-w-sm leading-relaxed">
              {description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href={banner?.link || '/catalogo?categoria=paletas'}
                className="inline-flex items-center gap-2 bg-[#C8FF00] text-[#111] px-7 py-3.5 font-black text-sm uppercase tracking-wider rounded hover:bg-white transition-colors duration-200"
              >
                VER PALETAS
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/catalogo?oferta=true"
                className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-7 py-3.5 font-black text-sm uppercase tracking-wider rounded hover:bg-white hover:text-[#111] transition-colors duration-200"
              >
                VER OFERTAS
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00] flex-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-base leading-none">+200</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Productos</p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00] flex-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-base leading-none">+15</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Marcas</p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00] flex-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-base leading-none">Envíos</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">A todo el país</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Columna derecha — Imagen ────────────────────────────────────── */}
          <div className="hidden md:flex items-center justify-end relative">
            {heroImage ? (
              <img
                src={heroImage}
                alt={banner?.title || 'Home Pádel'}
                className="relative z-10 h-[520px] w-auto object-contain object-center drop-shadow-2xl"
              />
            ) : (
              <div className="relative z-10 w-80 h-96 rounded-2xl bg-[#1a1a1a] border border-white/10 flex flex-col items-center justify-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center">
                  <span className="text-[#C8FF00] font-black text-2xl">HP</span>
                </div>
                <p className="text-gray-600 text-xs uppercase tracking-widest">
                  Subí una imagen desde el backoffice
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
