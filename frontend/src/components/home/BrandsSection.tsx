'use client';

import { useRef, useEffect } from 'react';
import { Brand } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  brands?: Brand[];
}

const FALLBACK_BRANDS: { id: string; name: string }[] = [
  { id: 'bullpadel', name: 'Bullpadel' },
  { id: 'nox', name: 'NOX' },
  { id: 'adidas', name: 'Adidas' },
  { id: 'babolat', name: 'Babolat' },
  { id: 'wilson', name: 'Wilson' },
  { id: 'head', name: 'Head' },
  { id: 'ulrich', name: 'Ulrich' },
  { id: 'prince', name: 'Prince' },
];

interface SlotProps {
  id: string;
  name: string;
  logo?: string;
  url?: string;
  suffix?: string;
}

function BrandSlot({ id, name, logo, url, suffix = '' }: SlotProps) {
  const key = id + suffix;
  const inner = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getImageUrl(logo)}
      alt={name}
      className="h-7 md:h-9 w-auto object-contain grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
    />
  ) : (
    <span className="text-gray-400 font-black text-sm uppercase tracking-wider hover:text-[#111] transition-colors whitespace-nowrap cursor-default">
      {name}
    </span>
  );

  return (
    <div key={key} className="flex items-center justify-center flex-none px-8 md:px-12">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}

export default function BrandsSection({ brands }: Props) {
  const hasBrands = brands && brands.length > 0;
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const SPEED = 0.55;

    const step = () => {
      if (!pausedRef.current) {
        const half = track.scrollWidth / 2;
        posRef.current = (posRef.current + SPEED) % half;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    const onEnter = () => { pausedRef.current = true; };
    const onLeave = () => { pausedRef.current = false; };

    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Render two copies for seamless loop
  const renderSlots = (suffix: string) =>
    hasBrands
      ? brands!.map((b) => (
          <BrandSlot
            key={b.id + suffix}
            id={b.id}
            name={b.name}
            logo={b.logo}
            url={b.url}
            suffix={suffix}
          />
        ))
      : FALLBACK_BRANDS.map((b) => (
          <BrandSlot key={b.id + suffix} id={b.id} name={b.name} suffix={suffix} />
        ));

  return (
    <section className="border-t border-b border-gray-100 py-7 overflow-hidden bg-white">
      <div className="flex items-center gap-0">
        {/* Etiqueta fija */}
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-300 whitespace-nowrap flex-none pl-4 md:pl-8 pr-4 md:pr-8 border-r border-gray-100 leading-tight">
          Marcas<br />Oficiales
        </p>

        {/* Track deslizante */}
        <div className="flex-1 overflow-hidden">
          <div ref={trackRef} className="flex will-change-transform">
            {renderSlots('')}
            {renderSlots('-dup')}
          </div>
        </div>
      </div>
    </section>
  );
}
