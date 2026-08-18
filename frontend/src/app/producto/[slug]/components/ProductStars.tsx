import { Star } from 'lucide-react';

interface Props {
  rating: number;
  count?: number;
}

export default function ProductStars({ rating, count }: Props) {
  const roundedRating = Math.round(rating * 10) / 10;
  const fullStars = Math.floor(roundedRating);
  const decimal = roundedRating - fullStars;
  
  const getStarType = (index: number): 'full' | 'half' | 'quarter' | 'threeQuarter' | 'empty' => {
    if (index < fullStars) return 'full';
    if (index === fullStars) {
      if (decimal >= 0.75) return 'full';
      if (decimal >= 0.5) return 'half';
      if (decimal >= 0.25) return 'quarter';
      return 'empty';
    }
    return 'empty';
  };

  const StarIcon = ({ type, starIndex }: { type: string; starIndex: number }) => {
    const baseClass = 'w-[16px] h-[16px]';
    
    if (type === 'full') {
      return <Star size={16} fill="#B7D31A" stroke="#B7D31A" />;
    }
    
    if (type === 'half') {
      return (
        <div className="relative w-[16px] h-[16px]">
          <Star size={16} fill="none" stroke="#8A8A85" className="absolute inset-0" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star size={16} fill="#B7D31A" stroke="#B7D31A" />
          </div>
        </div>
      );
    }
    
    if (type === 'quarter') {
      return (
        <div className="relative w-[16px] h-[16px]">
          <Star size={16} fill="none" stroke="#8A8A85" className="absolute inset-0" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '25%' }}>
            <Star size={16} fill="#B7D31A" stroke="#B7D31A" />
          </div>
        </div>
      );
    }
    
    return <Star size={16} fill="none" stroke="#8A8A85" />;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} type={getStarType(i)} starIndex={i} />
        ))}
      </div>
      
      <span className="text-sm font-bold text-[#B7D31A]">
        {roundedRating.toFixed(1)}
      </span>
      
      {count !== undefined && count > 0 && (
        <span className="text-xs text-[#8A8A85]">({count} valoraciones)</span>
      )}
    </div>
  );
}