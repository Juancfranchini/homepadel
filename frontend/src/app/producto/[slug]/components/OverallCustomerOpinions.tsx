import { Star } from 'lucide-react';

interface Props {
  averageRating: number;
  totalReviews: number;
  distribution: { stars: number; count: number; percentage: number }[];
}

export default function OverallCustomerOpinions({ averageRating, totalReviews, distribution }: Props) {
  return (
    <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#F7F6F7] mb-4">Opiniones de clientes</h3>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl font-bold text-[#F7F6F7]">{averageRating.toFixed(1)}</span>
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill={i < Math.round(averageRating) ? '#B7D31A' : 'none'} stroke={i < Math.round(averageRating) ? '#B7D31A' : '#8A8A85'} />
            ))}
          </div>
          <span className="text-xs text-[#8A8A85] mt-0.5">{totalReviews.toLocaleString()} calificaciones</span>
        </div>
      </div>

      <div className="space-y-2">
        {distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-2">
            <span className="text-xs text-[#C7C7C0] w-16 flex-shrink-0 text-left">{d.stars} estrellas</span>
            <div className="flex-1 h-2 bg-[#0D0F0F] rounded-full overflow-hidden">
              <div className="h-full bg-[#B7D31A] rounded-full" style={{ width: d.percentage + '%' }} />
            </div>
            <span className="text-xs text-[#8A8A85] w-10 text-right flex-shrink-0">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}