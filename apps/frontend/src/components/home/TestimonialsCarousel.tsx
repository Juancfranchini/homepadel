import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from '@/types';
import TestimonialCard from './TestimonialCard';

interface Props {
  activeItems: Testimonial[];
  currentItems: Testimonial[];
  hasSlider: boolean;
  totalGroups: number;
  currentGroup: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectGroup: (i: number) => void;
}

export default function TestimonialsCarousel({
  activeItems, currentItems, hasSlider, totalGroups, currentGroup, onPrev, onNext, onSelectGroup,
}: Props) {
  if (activeItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8A8A85] text-sm">Se el primero en dejar tu reseña.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {hasSlider && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 flex items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 flex items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 transition-all"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="flex gap-4 sm:gap-6 overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-2">
        {currentItems.map((t) => (
          <div key={t.id} className="w-[280px] sm:w-[340px] md:w-[340px] flex-shrink-0">
            <TestimonialCard t={t} />
          </div>
        ))}
      </div>

      {hasSlider && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalGroups }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectGroup(i)}
              className={'rounded-full transition-all ' + (i === currentGroup ? 'w-5 h-1.5 bg-[#B7D31A]' : 'w-1.5 h-1.5 bg-white/30')}
              aria-label={'Grupo ' + (i + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
