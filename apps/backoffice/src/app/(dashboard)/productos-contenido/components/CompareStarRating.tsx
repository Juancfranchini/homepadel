import { Plus, Minus, Star } from 'lucide-react';

function StarIcon({ filled, half }: { filled: boolean; half: boolean }) {
  if (filled) return <Star size={12} fill="#C8FF00" stroke="#C8FF00" />;
  if (half) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id={'half-star'}>
            <stop offset="50%" stopColor="#C8FF00" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill="url(#half-star)" />
      </svg>
    );
  }
  return <Star size={12} fill="none" stroke="#D1D5DB" />;
}

export default function CompareStarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => onChange(Math.max(0, value - 0.5))}
        className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center">
        <Minus size={12} className="text-gray-500" />
      </button>
      <span className="text-sm font-semibold text-gray-900 w-5 text-center">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(5, value + 0.5))}
        className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center">
        <Plus size={12} className="text-gray-500" />
      </button>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <StarIcon key={s} filled={value >= s} half={value >= s - 0.5 && value < s} />
        ))}
      </div>
    </div>
  );
}
