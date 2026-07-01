'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Props {
  products: Product[];
}

export default function RelatedProducts({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  return (
    <section className="border-t border-[#0D0F0F] py-14 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-8">
          PRODUCTOS RELACIONADOS
        </h2>
        <div className="relative">
          <button onClick={() => scrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#0C0C0C] border border-[#0D0F0F] flex items-center justify-center text-[#F7F6F7] hover:border-[#B7D31A] transition-colors hidden md:flex">
            <ChevronLeft size={14} />
          </button>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {products.map((p) => {
              const relDiscount = p.salePrice !== undefined && p.salePrice > 0 && p.salePrice < p.price;
              return (
                <Link key={p.id} href={'/producto/' + p.slug}
                  className="flex-none w-52 bg-[#0C0C0C] border border-[#0D0F0F] rounded-xl overflow-hidden hover:border-[#B7D31A]/30 transition-all group"
                  style={{ scrollSnapAlign: 'start' }}>
                  <div className="aspect-square bg-[#050606] overflow-hidden">
                    {p.images.length > 0 ? (
                      <img src={getImageUrl(p.images[0])} alt={p.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-white/[0.06]">{p.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-[#8A8A85] font-semibold uppercase tracking-wider">{p.brand?.name}</p>
                    <p className="text-[#F7F6F7] text-xs font-medium leading-snug mt-0.5 line-clamp-2">{p.name}</p>
                    <p className="text-[#F7F6F7] font-semibold text-sm mt-1.5">
                      {formatPrice(relDiscount ? p.salePrice! : p.price)}
                      {relDiscount && <span className="text-[#8A8A85] text-[10px] font-normal line-through ml-1.5">{formatPrice(p.price)}</span>}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#0C0C0C] border border-[#0D0F0F] flex items-center justify-center text-[#F7F6F7] hover:border-[#B7D31A] transition-colors hidden md:flex">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}