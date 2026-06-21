'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Testimonial } from '@/types';
import { getImageUrl } from '@/lib/utils';
import ReviewForm from './ReviewForm';

interface Props {
  testimonials: Testimonial[];
}

const PLACEHOLDER: Testimonial[] = [
  { id: '1', name: 'Martin G.', comment: 'Excelente atencion y productos de primera calidad. La paleta que compre supero mis expectativas.', rating: 5, order: 0, active: true },
  { id: '2', name: 'Lucia R.', comment: 'El envio fue rapidisimo y el asesoramiento por WhatsApp me ayudo a elegir la paleta ideal para mi nivel.', rating: 5, order: 1, active: true },
  { id: '3', name: 'Diego P.', comment: 'Los mejores precios del mercado. Compre mis zapatillas Bullpadel y llegaron en 48 horas.', rating: 5, order: 2, active: true },
];

export default function TestimonialsSection({ testimonials }: Props) {
  const [showForm, setShowForm] = useState(false);
  const items = testimonials && testimonials.length > 0 ? testimonials : PLACEHOLDER;

  return (
    <section className="bg-[#242A05] border-t border-[#0D0F0F] py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#F7F6F7] mb-2">
            LO QUE DICEN NUESTROS CLIENTES
          </h2>
          <p className="text-[#C7C7C0] text-sm">La experiencia de nuestra comunidad nos respalda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.slice(0, 3).map((t) => {
            const photoUrl = t.photo ? getImageUrl(t.photo) : null;
            const initials = t.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={t.id} className="bg-[#141A1D] rounded-2xl p-6 flex flex-col gap-4 border border-[#0D0F0F]">
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
                <p className="text-[#C7C7C0] text-sm leading-relaxed italic flex-1">
                  {t.comment}
                </p>
                <div className="flex justify-end gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < (t.rating || 5) ? '#B7D31A' : 'none'} stroke={i < (t.rating || 5) ? '#B7D31A' : '#8A8A85'} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

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