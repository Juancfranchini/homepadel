'use client';

import { useRef } from 'react';
import { Brand } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  brands: Brand[];
}

const FALLBACK: Brand[] = [
  { id: '1', name: 'NOX', slug: 'nox' },
  { id: '2', name: 'Bullpadel', slug: 'bullpadel' },
  { id: '3', name: 'Adidas', slug: 'adidas' },
  { id: '4', name: 'Head', slug: 'head' },
  { id: '5', name: 'Wilson', slug: 'wilson' },
  { id: '6', name: 'Babolat', slug: 'babolat' },
];

export default function BrandsSection({ brands }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = brands && brands.length > 0 ? brands : FALLBACK;

  return (
    <section className="bg-[#050606] border-t border-[#0D0F0F] py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#F7F6F7] mb-2">
            MARCAS QUE TRABAJAMOS
          </h2>
          <p className="text-[#C7C7C0] text-sm">Las mejores marcas del mundo del padel.</p>
        </div>
      </div>

      {/* Slider infinito */}
      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-12 animate-scroll"
          style={{ width: 'max-content' }}
        >
          {/* Duplicamos para efecto infinito */}
          {[...items, ...items].map((brand, i) => {
            const logoUrl = brand.logo ? getImageUrl(brand.logo) : null;
            return (
              <div key={i} className="flex items-center justify-center h-20 flex-shrink-0 px-6">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={brand.name}
                    className="max-h-full w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
                    style={{ maxWidth: '140px' }}
                  />
                ) : (
                  <span className="text-[#8A8A85] text-xl font-bold uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-[#F7F6F7] transition-all duration-300">
                    {brand.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}