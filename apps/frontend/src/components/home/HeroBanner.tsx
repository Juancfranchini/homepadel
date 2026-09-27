'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HeroSlide } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  slides: HeroSlide[];
}

const FALLBACK_SLIDE: HeroSlide = {
  id: '0',
  title: 'EQUIPAMIENTO DE\nALTO RENDIMIENTO',
  subtitle: 'Nueva Colección 2026',
  description: 'Descubri las paletas más avanzadas del mercado.',
  ctaPrimary: 'VER COLECCIÓN',
  ctaPrimaryUrl: '/catalogo',
  order: 0,
  active: true,
};

function SlideContent({ slide }: { slide: HeroSlide }) {
  const titleLines = (slide.title || '').split(/\\n|\n/);
  const accentLine = titleLines[titleLines.length - 1];
  const whiteLines = titleLines.slice(0, -1);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full h-full flex items-center">
      <div className="w-full max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0">
        {slide.subtitle && (
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-3 sm:mb-4">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-brand-fg">
              <path d="M2 8l5-5 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-brand-fg text-xs font-bold uppercase tracking-[0.25em]">{slide.subtitle}</span>
          </div>
        )}

        <h2 className="font-extrabold leading-none uppercase mb-4 text-center lg:text-left">
          {whiteLines.map((line, i) => (
            <span key={i} className="text-fg block text-2xl sm:text-4xl md:text-5xl xl:text-6xl whitespace-normal leading-tight">{line}</span>
          ))}
          <span className="text-brand-fg block text-2xl sm:text-4xl md:text-5xl xl:text-6xl whitespace-normal leading-tight">{accentLine}</span>
        </h2>

        {slide.description && (
          <p className="text-fg-soft text-xs sm:text-sm md:text-base max-w-xs sm:max-w-md mb-4 sm:mb-6 leading-relaxed text-center lg:text-left mx-auto lg:mx-0">{slide.description}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center lg:justify-start">
          {slide.ctaPrimary && (
            <Link href={slide.ctaPrimaryUrl || '/catalogo'}
              className="bg-[#B7D31A] text-[#050606] px-5 sm:px-7 py-3 sm:py-3.5 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg btn-primary-glow inline-flex items-center gap-2 hover:bg-[#B7D31A] transition-colors duration-200 w-full sm:w-auto justify-center max-w-xs mx-auto lg:mx-0">
              {slide.ctaPrimary}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
          {slide.ctaSecondary && (
            <Link href={slide.ctaSecondaryUrl || '/catalogo'}
              className="inline-flex items-center gap-2 bg-transparent text-fg border-2 border-fg/30 px-5 sm:px-7 py-3 sm:py-3.5 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg hover:border-white transition-colors duration-200 w-full sm:w-auto justify-center max-w-xs mx-auto lg:mx-0">
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
      // Los banners que se cargan desde el backoffice miden en la práctica
      // entre 16:9 y 2:1 (relación ancho/alto). Antes la altura era un valor
      // fijo en píxeles y el ancho ocupaba toda la pantalla: en un monitor
      // ancho eso arma una caja mucho más achatada que la imagen real, y
      // `background-size: cover` termina recortando gran parte de arriba y
      // abajo para taparla. Con la relación de aspecto fija a algo cercano a
      // la imagen, el recorte que hace `cover` queda mínimo en vez de
      // agresivo. `max-h` evita que en un monitor ultra ancho el banner se
      // vuelva desmesuradamente alto.
      className="relative w-full overflow-hidden min-h-[380px] sm:aspect-[9/5] sm:min-h-0 sm:max-h-[560px] flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {bgImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-[position:70%_center] sm:bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(' + bgImage + ')' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-page/95 via-page/40 to-transparent sm:from-page/90 sm:via-page/60 sm:to-page/20 md:to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-page via-[#061E29] light:via-[#EAF1F2] to-[#030F14] light:to-[#F2F5F4]" />
      )}

      <SlideContent slide={slide} />

      {isMulti && (
        <>
          <button onClick={prev} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-fg/10 flex items-center justify-center text-fg hover:bg-fg/20" aria-label="Anterior">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4l-6 6 6 6"/></svg>
          </button>
          <button onClick={next} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-fg/10 flex items-center justify-center text-fg hover:bg-fg/20" aria-label="Siguiente">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 4l6 6-6 6"/></svg>
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {displaySlides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={'rounded-full transition-all ' + (i === current ? 'w-5 h-1.5 bg-[#B7D31A]' : 'w-1.5 h-1.5 bg-fg/30')}
                aria-label={'Slide ' + (i + 1)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
