'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Testimonial } from '@/types';
import ReviewForm from './ReviewForm';
import TestimonialsCarousel from './TestimonialsCarousel';

interface Props {
  testimonials: Testimonial[];
}

const PLACEHOLDER: Testimonial[] = [
  { id: '1', name: 'Martin G.', comment: 'Excelente atencion y productos de primera calidad.', rating: 5, order: 0, active: true },
  { id: '2', name: 'Lucia R.', comment: 'El envío fue rapidisimo y el asesoramiento por WhatsApp me ayudo.', rating: 5, order: 1, active: true },
  { id: '3', name: 'Diego P.', comment: 'Los mejores precios del mercado.', rating: 5, order: 2, active: true },
];

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
    <section className="bg-[#242A05] border-t border-[#0D0F0F] py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold uppercase text-[#F7F6F7] mb-2">
            LO QUE DICEN NUESTROS CLIENTES
          </h2>
          <p className="text-[#C7C7C0] text-xs sm:text-sm">La experiencia de nuestra comunidad nos respalda.</p>
        </div>

        <TestimonialsCarousel
          activeItems={activeItems}
          currentItems={currentItems}
          hasSlider={hasSlider}
          totalGroups={totalGroups}
          currentGroup={currentGroup}
          onPrev={prevGroup}
          onNext={nextGroup}
          onSelectGroup={setCurrentGroup}
        />

        {!showForm && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 sm:px-12 py-3 sm:py-4 bg-[#B7D31A] text-[#050606] rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wider btn-primary-glow transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Deja tu reseña
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
