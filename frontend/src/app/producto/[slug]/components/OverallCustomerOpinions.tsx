'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Props {
  productId: string;
  onHasReviews?: (v: boolean) => void;
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: { stars: number; count: number; percentage: number }[];
}

export default function OverallCustomerOpinions({ productId, onHasReviews }: Props) {
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    fetch(API_URL + '/reviews?productId=' + productId)
      .then((res) => res.json())
      .then((data) => {
        const reviews = Array.isArray(data) ? data.filter((r: any) => r.active !== false) : [];
        if (reviews.length === 0) { setStats(null); onHasReviews?.(false); return; }
        const total = reviews.length;
        const avg = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / total;
        const distribution = [5,4,3,2,1].map((stars) => {
          const count = reviews.filter((r: any) => r.rating === stars).length;
          return { stars, count, percentage: Math.round((count / total) * 100) };
        });
        setStats({ average: Math.round(avg * 10) / 10, total, distribution });
        onHasReviews?.(true);
      })
      .catch(() => {});
  }, [productId]);

  if (!stats) return null;

  return (
    <div className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-5 h-full">
      <h3 className="text-sm font-semibold text-[#F7F6F7] mb-4">Opiniones de clientes</h3>
      <div className="flex flex-col items-center text-center mb-4">
        <p className="text-3xl font-black text-[#F7F6F7]">{stats.average}</p>
        <div className="flex gap-0.5 my-1">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={'w-4 h-4 ' + (s <= Math.round(stats.average) ? 'text-[#B7D31A] fill-[#B7D31A]' : 'text-[#1A1F21]')} />
          ))}
        </div>
        <p className="text-xs text-[#8A8A85]">{stats.total} opiniones</p>
      </div>
      <div className="space-y-1.5">
        {stats.distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-right text-[#C7C7C0]">{d.stars} estrellas</span>
            <div className="flex-1 h-2 bg-[#1A1F21] rounded-full overflow-hidden">
              <div className="h-full bg-[#B7D31A] rounded-full transition-all duration-500" style={{ width: d.percentage + '%' }} />
            </div>
            <span className="w-8 text-[#8A8A85]">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
