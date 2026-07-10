'use client';

import { useRef } from 'react';
import { Star, Check } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface Review {
  id: string;
  name: string;
  comment: string;
  rating: number;
  photo?: string;
}

interface Props {
  reviews: Review[];
}

const PLACEHOLDER_REVIEWS: Review[] = [
  { id: '1', name: 'Martin G.', comment: 'Excelente paleta. El control y la potencia son increibles. La recomiendo totalmente para jugadores avanzados.', rating: 5 },
  { id: '2', name: 'Lucia R.', comment: 'Muy buen producto. Llego en perfectas condiciones y el envio fue rapidisimo.', rating: 4 },
  { id: '3', name: 'Diego P.', comment: 'La mejor paleta que he probado. El balance es perfecto y los materiales de primera calidad.', rating: 5 },
  { id: '4', name: 'Carla S.', comment: 'Buena relacion precio-calidad. La uso hace 3 meses y sigue como nueva.', rating: 4 },
];

export default function ProductReviews({ reviews }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayReviews = reviews.length > 0 ? reviews : PLACEHOLDER_REVIEWS;
  const hasSlider = displayReviews.length > 2;

  return (
    <div className="relative h-full">
      {hasSlider && (
        <>
          <button onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 flex items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 transition-all">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4l-6 6 6 6"/></svg>
          </button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 flex items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 transition-all">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 4l6 6-6 6"/></svg>
          </button>
        </>
      )}

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide h-full" style={{ scrollSnapType: 'x mandatory', height: '100%' }}>
        {displayReviews.map((r) => {
          const initials = r.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          return (
            <div key={r.id} className="flex-none w-[320px] h-full" style={{ scrollSnapAlign: 'start' }}>
              <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-5 flex gap-4 h-full">
                <div className="flex-shrink-0">
                  {r.photo ? (
                    <img src={getImageUrl(r.photo)} alt={r.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#B7D31A]/30" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#B7D31A]/10 border-2 border-[#B7D31A]/30 flex items-center justify-center">
                      <span className="text-[#B7D31A] font-bold text-sm">{initials}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <p className="text-[#F7F6F7] font-semibold text-sm">{r.name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < r.rating ? '#B7D31A' : 'none'} stroke={i < r.rating ? '#B7D31A' : '#8A8A85'} />
                    ))}
                  </div>
                  <p className="text-[#C7C7C0] text-sm leading-relaxed mt-3">{r.comment}</p>
                  <div className="flex items-center gap-1.5 mt-auto pt-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-[#B7D31A]" />
                    </div>
                    <span className="text-[#B7D31A] text-xs font-medium">Comprador verificado</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}