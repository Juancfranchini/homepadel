'use client';

import { useState, useEffect } from 'react';
import { Star, User, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Review {
  active?: boolean;
  id: string;
  name: string;
  photo?: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

interface Props {
  productId: string;
}

export default function ProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(API_URL + '/reviews?productId=' + productId)
      .then((res) => res.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : (data?.data || []);
        setReviews(all.filter((r: Review) => r.active !== false));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return null;
  if (reviews.length === 0) return null;

  const itemsPerView = 3;
  const totalPages = Math.ceil(reviews.length / itemsPerView);
  const next = () => setCurrentIndex((p) => Math.min(p + 1, totalPages - 1));
  const prev = () => setCurrentIndex((p) => Math.max(p - 1, 0));
  const visibleReviews = reviews.slice(currentIndex * itemsPerView, (currentIndex + 1) * itemsPerView);

  return (
    <div className="relative flex flex-col h-full">
      <div className="grid grid-cols-3 gap-3 flex-1">
        {visibleReviews.map((review) => (
          <div key={review.id} className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1A1F21] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {review.photo ? (
                  <img src={review.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#8A8A85]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-sm text-[#F7F6F7]">{review.name}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={'w-3.5 h-3.5 ' + (s <= review.rating ? 'text-[#B7D31A] fill-[#B7D31A]' : 'text-[#1A1F21]')} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-[#C7C7C0] leading-relaxed flex-1 line-clamp-3 mb-3">{review.comment}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8A8A85]">
                {new Date(review.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '') + ', ' + new Date(review.createdAt).getFullYear()}
              </span>
              {review.verified && (
                <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <CheckCircle className="w-2.5 h-2.5" />Verificado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-3 z-10">
          <button onClick={prev} disabled={currentIndex === 0}
            className="w-7 h-7 rounded-full bg-[#1A1F21]/90 border border-[#0D0F0F] flex items-center justify-center hover:border-[#B7D31A]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={14} className="text-[#8A8A85]" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)}
                className={'rounded-full transition-all ' + (i === currentIndex ? 'w-5 h-1.5 bg-[#B7D31A]' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50')} />
            ))}
          </div>
          <button onClick={next} disabled={currentIndex === totalPages - 1}
            className="w-7 h-7 rounded-full bg-[#1A1F21]/90 border border-[#0D0F0F] flex items-center justify-center hover:border-[#B7D31A]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={14} className="text-[#8A8A85]" />
          </button>
        </div>
      )}
    </div>
  );
}
