import { Star } from 'lucide-react';
import { Testimonial } from '@/types';
import { getImageUrl } from '@/lib/utils';

export default function TestimonialCard({ t }: { t: Testimonial }) {
  const photoUrl = t.photo ? getImageUrl(t.photo) : null;
  const initials = t.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="bg-[#141A1D] rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 border border-[#0D0F0F] h-full">
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
