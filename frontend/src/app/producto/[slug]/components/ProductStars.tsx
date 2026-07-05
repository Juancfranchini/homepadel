import { Star } from 'lucide-react';

interface Props {
  rating: number;
  count?: number;
}

export default function ProductStars({ rating, count }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill={i < rating ? '#B7D31A' : 'none'} stroke={i < rating ? '#B7D31A' : '#8A8A85'} />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-[#8A8A85]">({count} valoraciones)</span>
      )}
    </div>
  );
}