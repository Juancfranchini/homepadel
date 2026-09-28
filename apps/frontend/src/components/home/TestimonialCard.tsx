import { Star } from 'lucide-react';
import { Testimonial } from '@/types';
import { getImageUrl } from '@/lib/utils';

export default function TestimonialCard({ t }: { t: Testimonial }) {
  const photoUrl = t.photo ? getImageUrl(t.photo) : null;
  const initials = t.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="bg-[#141A1D] light:bg-[#EAEEE8] rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 border border-line h-full">
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#B7D31A]/30">
            <img src={photoUrl} alt={t.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#B7D31A]/10 border-2 border-[#B7D31A]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-fg font-bold text-sm">{initials}</span>
          </div>
        )}
        <p className="text-fg font-semibold text-sm">{t.name}</p>
      </div>
      <p className="text-fg-soft text-sm leading-relaxed italic flex-1">{t.comment}</p>
      <div className="flex justify-end gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill={i < (t.rating || 5) ? '#B7D31A' : 'none'} stroke={i < (t.rating || 5) ? '#B7D31A' : 'currentColor'} className="text-fg-muted" />
        ))}
      </div>
    </div>
  );
}
