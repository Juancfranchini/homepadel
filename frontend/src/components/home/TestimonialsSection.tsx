'use client';

import { useState } from 'react';
import { Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from '@/types';
import { getImageUrl } from '@/lib/utils';
import ReviewForm from './ReviewForm';

interface Props {
  testimonials: Testimonial[];
}

const PLACEHOLDER: Testimonial[] = [
  { id: '1', name: 'Martin G.', comment: 'Excelente atencion y productos de primera calidad.', rating: 5, order: 0, active: true },
  { id: '2', name: 'Lucia R.', comment: 'El envio fue rapidisimo y el asesoramiento por WhatsApp me ayudo.', rating: 5, order: 1, active: true },
  { id: '3', name: 'Diego P.', comment: 'Los mejores precios del mercado.', rating: 5, order: 2, active: true },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  const photoUrl = t.photo ? getImageUrl(t.photo) : null;
  const initials = t.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="bg-[#141A1D] rounded-2xl p-6 flex flex-col gap-4 border border-[#0D0F0F] h-full">
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#B7D31A]/30">
            <img src={photoUrl} alt={t.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#B7D31A]/10 border-2 border-[#B7D31A]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[#B7D31A] font-bold text-sm">{initials}</span>
          </div>
        )}
        <p className="text-[#F7F6F7] font-semibold text-sm">{t.name}</p>
      </div>
      <p className="text-[#C7C7C0] text-sm leading-relaxed italic flex-1">{t.comment}</p>
      <div className="flex justify-end gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill={i < (t.rating || 5) ? '#B7D31A' : 'none'} stroke={i < (t.rating || 5) ? '#B7D31A' : '#8A8A85'} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection({ testimonials }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(0);
  const items = testimonials && testimonials.length > 0 ? testimonials : PLACEHOLDER;
  const activeItems = items.filter(t => t.active);

  const itemsPerGroup = 3;
  const totalGroups = Math.ceil(activeItems.length / itemsPerGroup);
  const currentItems = activeItems.slice(currentGroup * itemsPerGroup, (currentGroup + 1) * itemsPerGroup);
  const hasSlider = activeItems.length > itemsPerGroup;

  const nextGroup = () => setCurrentGroup((prev) => (prev + 1) % totalGroups);
  const prevGroup = () => setCurrentGroup((prev) => (prev - 1 + totalGroups) % totalGroups);

  return (
    <section className="bg-[#242A05] border-t border-[#0D0F0F] py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#F7F6F7] mb-2">
            LO QUE DICEN NUESTROS CLIENTES
          </h2>
          <p className="text-[#C7C7C0] text-sm">La experiencia de nuestra comunidad nos respalda.</p>
        </div>

        {activeItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8A8A85] text-sm">Se el primero en dejar tu resena.</p>
          </div>
        ) : (
          <div className="relative">
            {hasSlider && (
              <>
                <button
                  onClick={prevGroup}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 flex items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 transition-all"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextGroup}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 flex items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 transition-all"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="flex justify-center gap-6 flex-wrap">
              {currentItems.map((t) => (
                <div key={t.id} className="w-full md:w-[340px] flex-shrink-0">
                  <TestimonialCard t={t} />
                </div>
              ))}
            </div>

            {hasSlider && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalGroups }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentGroup(i)}
                    className={'rounded-full transition-all ' + (i === currentGroup ? 'w-5 h-1.5 bg-[#B7D31A]' : 'w-1.5 h-1.5 bg-white/30')}
                    aria-label={'Grupo ' + (i + 1)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!showForm && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-12 py-4 bg-[#B7D31A] text-[#050606] rounded-xl font-semibold text-sm uppercase tracking-wider btn-primary-glow transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Deja tu resena
            </button>
          </div>
        )}

        {showForm && (
          <div className="mt-10 max-w-lg mx-auto">
            <ReviewForm onClose={() => setShowForm(false)} />
          </div>
        )}
      </div>
    </section>
  );
}