'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Banner } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  banners: Banner[];
}

const FALLBACK: Banner[] = [
  {
    id: '1',
    title: 'NUEVA COLECCIÓN 2026',
    subtitle: 'Zapatillas premium',
    ctaText: 'VER COLECCIÓN',
    link: '/catalogo?categoria=zapatillas',
    image: '',
    order: 0,
    active: true,
  },
  {
    id: '2',
    title: 'HASTA 40% OFF',
    subtitle: 'Indumentaria temporada anterior',
    ctaText: 'VER OFERTAS',
    link: '/catalogo?oferta=true',
    image: '',
    order: 1,
    active: true,
  },
];

export default function PromoBanners({ banners }: Props) {
  const items = banners && banners.length > 0 ? banners : FALLBACK;
  const [current, setCurrent] = useState(0);
  const isCarousel = items.length > 2;

  useEffect(() => {
    if (!isCarousel) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isCarousel, items.length]);

  const displayItems = isCarousel ? [items[current]] : items.slice(0, 2);

  return (
    <section className="relative bg-gradient-to-b from-[#030F14] to-[#0D2028] py-6 light:from-[#F2F5F4] light:to-[#E6EEEF] sm:py-10 md:py-14">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B7D31A]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          {displayItems.map((banner) => {
            const bgImage = (banner as Banner).image ? getImageUrl((banner as Banner).image!) : null;

            return (
              <div
                key={banner.id}
                className="relative rounded-xl sm:rounded-2xl overflow-hidden h-40 sm:h-48 md:h-64 lg:h-72 flex flex-col items-center justify-end text-center md:items-start md:justify-end md:text-left p-3 sm:p-4 md:p-6 lg:p-8"
              >
                {bgImage ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: 'url(' + bgImage + ')' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030F14] light:from-[#F2F5F4] via-[#030F14]/60 light:via-[#F2F5F4]/60 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-panel to-chip" />
                )}

                <div className="relative z-10 flex flex-col items-center md:items-start gap-1 sm:gap-1.5 w-full">
                  <p className="text-brand-fg text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-center md:text-left">
                    {banner.subtitle}
                  </p>
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold text-fg uppercase leading-tight text-center md:text-left">
                    {banner.title}
                  </h3>
                  {banner.ctaText && (
                    <Link
                      href={banner.link || '/catalogo'}
                      className="inline-flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-ocean text-fg hover:bg-ocean-2 hover:translate-y-[-2px] w-full sm:w-auto"
                    >
                      {banner.ctaText}
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}