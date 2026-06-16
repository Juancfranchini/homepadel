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
  title: 'TU MEJOR JUEGO\nEMPIEZA ACA',
  subtitle: 'Nueva Temporada 2026',
  description: 'Equipamiento premium para jugadores que van por mas.',
  ctaPrimary: 'VER PALAS 2026',
  ctaPrimaryUrl: '/catalogo?categoria=paletas',
  ctaSecondary: undefined,
  ctaSecondaryUrl: undefined,
  order: 0,
  active: true,
};

function SlideContent({ slide }: { slide: HeroSlide }) {
  const titleLines = (slide.title || '').split(/\\n|\n/);
  const accentLine = titleLines[titleLines.length - 1];
  const whiteLines = titleLines.slice(0, -1);
  const heroImage = slide.image ? getImageUrl(slide.image) : null;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 w-full h-full flex items-center">
      <div className="w-full">
        {slide.subtitle && (
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8l5-5 7 7" stroke="#B7D31A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[#B7D31A] text-xs font-bold uppercase tracking-[0.25em]">
              {slide.subtitle}
            </span>
          </div>
        )}

        <h1 className="font-extrabold leading-none uppercase mb-4">
          {whiteLines.map((line, i) => (
            <span key={i} className="text-[#F7F6F7] block text-4xl md:text-5xl xl:text-6xl whitespace-nowrap">
              {line}
            </span>
          ))}
          <span className="text-[#B7D31A] block text-4xl md:text-5xl xl:text-6xl whitespace-nowrap">
            {accentLine}
          </span>
        </h1>

        {slide.description && (
          <p className="text-[#C7C7C0] text-sm md:text-base max-w-md mb-6">
            {slide.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {slide.ctaPrimary && (
            <Link
              href={slide.ctaPrimaryUrl || '/catalogo'}
              className="bg-[#B7D31A] text-[#050606] px-7 py-3.5 font-extrabold text-sm uppercase tracking-wider rounded-lg btn-primary-glow inline-flex items-center gap-2 hover:bg-[#B7D31A] transition-colors duration-200"
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
              className="inline-flex items-center gap-2 bg-transparent text-[#F7F6F7] border-2 border-white/30 px-7 py-3.5 font-extrabold text-sm uppercase tracking-wider rounded-lg hover:border-white transition-colors duration-200"
            >
              {slide.ctaSecondary}
            </Link>
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

  const next = useCallback(() => setCurrent((c) => (c + 1) % displaySlides.length), [displaySlides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + displaySlides.length) % displaySlides.length), [displaySlides.length]);

  useEffect(() => {
    if (!isMulti || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isMulti, paused, next]);

  const slide = displaySlides[current];
  const bgImage = slide.image ? getImageUrl(slide.image) : null;

  return (
    <section
      className="relative w-full overflow-hidden min-h-[420px] md:min-h-[520px] flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Imagen de fondo full-width */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(' + bgImage + ')' }}
          />
          {/* Overlay oscuro sobre la imagen para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050606] via-[#050606]/80 to-[#050606]/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#050606] via-[#061E29] to-[#030F14]" />
      )}

      <SlideContent slide={slide} />

      {/* Controles carrusel */}
      {isMulti && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#F7F6F7] hover:bg-white/20"
            aria-label="Anterior"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 4l-6 6 6 6"/>
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#F7F6F7] hover:bg-white/20"
            aria-label="Siguiente"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 4l6 6-6 6"/>
            </svg>
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={'rounded-full transition-all ' + (i === current ? 'w-5 h-1.5 bg-[#B7D31A]' : 'w-1.5 h-1.5 bg-white/30')}
                aria-label={'Slide ' + (i + 1)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}