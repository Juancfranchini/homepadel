'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HeroSlide } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  slides: HeroSlide[];
}

const FALLBACK_SLIDE: HeroSlide = {
  id: 'fallback',
  title: 'TU MEJOR JUEGO\nEMPIEZA ACÁ',
  subtitle: 'Nueva Temporada 2026',
  description: 'Equipamiento premium para jugadores que van por más.',
  ctaPrimary: 'VER PALAS 2026',
  ctaPrimaryUrl: '/catalogo?categoria=paletas',
  ctaSecondary: undefined,
  ctaSecondaryUrl: undefined,
  order: 0,
  active: true,
};

function SlideContent({ slide }: { slide: HeroSlide }) {
  const titleLines = (slide.title || '').split(/\\n|\n/);
  const limeLine = titleLines[titleLines.length - 1];
  const whiteLines = titleLines.slice(0, -1);
  const heroImage = slide.image ? getImageUrl(slide.image) : null;

  return (
    <>
      {/* Imagen de fondo — cubre el 100% del ancho de la sección */}
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Gradiente sobre la imagen para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full h-full flex items-center">
        <div className="flex flex-col gap-4 py-10 max-w-lg">
          {slide.subtitle && (
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8l5-5 7 7" stroke="#D4FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#D4FF00] text-xs font-bold uppercase tracking-[0.25em]">
                {slide.subtitle}
              </span>
            </div>
          )}

          <h1 className="font-black leading-none tracking-tight uppercase">
            {whiteLines.map((line, i) => (
              <span key={i} className="text-white block text-4xl md:text-5xl xl:text-6xl whitespace-nowrap">
                {line}
              </span>
            ))}
            <span className="text-[#D4FF00] block text-4xl md:text-5xl xl:text-6xl whitespace-nowrap">
              {limeLine}
            </span>
          </h1>

          {slide.description && (
            <p className="text-gray-300 text-sm md:text-base max-w-sm leading-relaxed">
              {slide.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-1">
            {slide.ctaPrimary && (
              <Link
                href={slide.ctaPrimaryUrl || '/catalogo'}
                className="inline-flex items-center gap-2 bg-[#D4FF00] text-[#111] px-7 py-3.5 font-black text-sm uppercase tracking-wider rounded hover:bg-white transition-colors duration-200"
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
                className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/30 px-7 py-3.5 font-black text-sm uppercase tracking-wider rounded hover:border-white transition-colors duration-200"
              >
                {slide.ctaSecondary}
              </Link>
            )}
          </div>
        </div>

        {/* Badge 9 cuotas — esquina superior derecha */}
        <div className="absolute top-6 right-6 bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-right hidden md:block">
          <p className="text-gray-500 text-[9px] uppercase tracking-widest leading-none mb-0.5">HASTA</p>
          <p className="text-[#D4FF00] font-black text-5xl leading-none">9</p>
          <p className="text-white font-black text-[10px] uppercase tracking-widest leading-tight mt-1">CUOTAS<br/>SIN INTERÉS</p>
          <div className="flex justify-end gap-1 mt-2">
            <div className="w-5 h-3 bg-gray-700 rounded-sm" />
            <div className="w-5 h-3 bg-gray-700 rounded-sm" />
          </div>
        </div>
      </div>
    </>
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

  useEffect(() => {
    if (!isMulti || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isMulti, paused, next]);

  const slide = displaySlides[current];
  const bgImage = slide.image ? getImageUrl(slide.image) : null;

  return (
    <section
      className="relative w-full bg-[#0a0a0a] overflow-hidden h-[480px] md:h-[580px] flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#0f0f0f]" />

      {/* Imagen de fondo en mobile */}
      {bgImage && (
        <div
          className="absolute inset-0 md:hidden opacity-15 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      <SlideContent slide={slide} />

      {/* Controles carrusel */}
      {isMulti && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/8 border border-white/15 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
            aria-label="Slide anterior"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 4l-6 6 6 6"/>
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/8 border border-white/15 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
            aria-label="Slide siguiente"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4l6 6-6 6"/>
            </svg>
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-1.5 bg-[#D4FF00]' : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
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
