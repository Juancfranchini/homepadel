import { Star } from 'lucide-react';

export default function AverageStarRow({ average }: { average: number }) {
  return (
    <div className="flex gap-0.5 mb-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const fullStars = Math.floor(average);
        const decimal = average - fullStars;

        let starType: 'full' | 'half' | 'empty' = 'empty';
        if (s <= fullStars) starType = 'full';
        else if (s === fullStars + 1 && decimal >= 0.25) starType = 'half';

        if (starType === 'full') {
          return <Star key={s} className="w-5 h-5 text-[#B7D31A] fill-[#B7D31A]" />;
        }
        if (starType === 'half') {
          return (
            <div key={s} className="relative w-5 h-5">
              <Star className="absolute inset-0 w-5 h-5 text-[#1A1F21]" fill="none" />
              <div className="absolute inset-0 overflow-hidden" style={{ width: decimal >= 0.5 ? '50%' : '25%' }}>
                <Star className="w-5 h-5 text-[#B7D31A] fill-[#B7D31A]" />
              </div>
            </div>
          );
        }
        return <Star key={s} className="w-5 h-5 text-[#1A1F21]" fill="none" />;
      })}
    </div>
  );
}
