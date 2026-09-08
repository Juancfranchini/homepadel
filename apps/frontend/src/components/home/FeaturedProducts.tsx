'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import FeaturedProductCard from './FeaturedProductCard';

interface Props {
  products: Product[];
  mode: 'best_sellers' | 'featured';
}

export default function FeaturedProducts({ products, mode }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const displayProducts = products.slice(0, 5);
  const sectionTitle = mode === 'best_sellers' ? 'LOS MÁS VENDIDOS' : 'PRODUCTOS DESTACADOS';
  const sectionSubtitle = mode === 'best_sellers'
    ? 'Los favoritos de nuestra comunidad.'
    : 'Seleccionados especialmente para vos.';

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  return (
    <section className="bg-[#050606] py-8 sm:py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold uppercase text-[#F7F6F7]">
              {sectionTitle}
            </h2>
            <p className="text-[#C7C7C0] text-xs sm:text-sm mt-0.5">{sectionSubtitle}</p>
          </div>
          <Link href="/catalogo" className="text-xs sm:text-sm font-semibold text-[#B7D31A] hover:text-[#CAE52E] flex items-center gap-1 uppercase transition-colors self-start sm:self-auto">
            VER TODOS <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative">
          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 rounded-full items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 hover:border-[#B7D31A] transition-all hidden md:flex">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4l-6 6 6 6"/></svg>
          </button>

          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {displayProducts.map(p => (
              <div key={p.id} className="flex-none w-[200px] sm:w-[240px] md:w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                <FeaturedProductCard product={p} />
              </div>
            ))}
          </div>

          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 rounded-full items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 hover:border-[#B7D31A] transition-all hidden md:flex">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
