'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HeroSlide } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  slides: HeroSlide[];
}

// Slide estático de fallback cuando no hay datos en el backend
const FALLBACK_SLIDE: HeroSlide = {
  id: 'fallback',
  title: 'EQUIPAMIENTO\nDE ALTO\nRENDIMIENTO',
  subtitle: 'Nueva Temporada 2025',
  description: 'Productos seleccionados para jugadores exigentes que buscan llevar su juego al siguiente nivel.',
  ctaPrimary: 'VER PALETAS',
  ctaPrimaryUrl: '/catalogo?categoria=paletas',
  ctaSecondary: 'VER OFERTAS',
  ctaSecondaryUrl: '/catalogo?oferta=true',
  order: 0,
  active: true,
};

function SlideContent({ slide }: { slide: HeroSlide }) {
  const titleLines = (slide.title || '').split(/\\n|\n/);
  const limeLine = titleLines[titleLines.length - 1];
  const whiteLines = titleLines.slice(0, -1);
  const heroImage = slide.image ? getImageUrl(slide.image) : null;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full h-full flex items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">

        {/* ── Columna izquierda — Texto ────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {slide.subtitle && (
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8l5-5 7 7" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#C8FF00] text-xs font-bold uppercase tracking-[0.25em]">
                {slide.subtitle}
              </span>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-none tracking-tight uppercase">
            {whiteLines.map((line, i) => (
              <span key={i} className="text-white block">{line}</span>
            ))}
            <span className="text-[#C8FF00] block">{limeLine}</span>
          </h1>

          {slide.description && (
            <p className="text-gray-400 text-sm md:text-base max-w-sm leading-relaxed">
              {slide.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-2">
            {slide.ctaPrimary && (
              <Link
                href={slide.ctaPrimaryUrl || '/catalogo'}
                className="inline-flex items-center gap-2 bg-[#C8FF00] text-[#111] px-7 py-3.5 font-black text-sm uppercase tracking-wider rounded hover:bg-white transition-colors duration-200"
              >
                {slide.ctaPrimary}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
            {slide.ctaSecondary && (
              <Link
                href={slide.ctaSecondaryUrl || '/catalogo'}
                className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-7 py-3.5 font-black text-sm uppercase tracking-wider rounded hover:bg-white hover:text-[#111] transition-colors duration-200"
              >
                {slide.ctaSecondary}
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
            {[
              { icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', label: 'Productos', value: '+200' },
              { icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', label: 'Marcas', value: '+15' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {i > 0 && <div className="w-px h-8 bg-white/10" />}
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00] flex-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={s.icon}/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-base leading-none">{s.value}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">{s.label}</p>
                </div>
              </div>
            ))}
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00] flex-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-base leading-none">Envíos</p>
                <p className="text-gray-500 text-xs uppercase tracking-wide">A todo el país</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna derecha — Imagen ─────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-end relative">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={slide.title}
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
  );
}

export default function HeroBanner({ slides }: Props) {
  const displaySlides = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const isMulti = displaySlides.length > 1;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % displaySlides.length);
  }, [displaySlides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  // Autoplay cada 5 segundos
  useEffect(() => {
    if (!isMulti || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isMulti, paused, next]);

  const slide = displaySlides[current];
  const bgImage = slide.image ? getImageUrl(slide.image) : null;

  return (
    <section
      className="relative w-full bg-[#111] overflow-hidden min-h-[580px] md:min-h-[640px] flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#111] to-[#1a1a1a]" />

      {/* Imagen de fondo en mobile */}
      {bgImage && (
        <div
          className="absolute inset-0 md:hidden opacity-20 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      {/* Contenido del slide */}
      <SlideContent slide={slide} />

      {/* ── Controles del carrusel ─────────────────────────────────────── */}
      {isMulti && (
        <>
          {/* Flechas */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Slide anterior"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 4l-6 6 6 6"/>
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Slide siguiente"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4l6 6-6 6"/>
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-[#C8FF00]'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
