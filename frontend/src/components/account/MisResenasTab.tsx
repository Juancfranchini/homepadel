'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  active: boolean;
  createdAt: string;
  product?: { id: string; name: string; slug: string; images: string[] };
}

export default function MisreseñasTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    fetch(API_URL + '/reviews/my', { headers: { Authorization: 'Bearer ' + token } })
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div>
        <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5">
          <MessageSquare size={20} className="text-[#B7D31A]" />Mis reseñas
        </h2>
        <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-20 bg-[#1A1F21] rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5">
        <MessageSquare size={20} className="text-[#B7D31A]" />Mis reseñas
      </h2>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-[#1A1F21] mb-4" />
          <p className="text-[#8A8A85] font-medium mb-1">Todavia no hiciste reseñas</p>
          <p className="text-[#8A8A85] text-sm">Cuando compres un producto, podras dejar tu reseña desde aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const imgSrc = review.product?.images?.[0] ? getImageUrl(review.product.images[0]) : null;
            return (
              <div key={review.id} className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-4 flex gap-3 items-start">
                {imgSrc ? <img src={imgSrc} alt="" className="w-12 h-12 rounded-lg object-cover border border-[#0D0F0F] flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-lg bg-[#1A1F21] flex items-center justify-center flex-shrink-0"><ImageIcon className="w-4 h-4 text-[#8A8A85]" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F7F6F7]">{review.product?.name || 'Producto'}</p>
                  <div className="flex gap-0.5 my-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={'w-3 h-3 ' + (s <= review.rating ? 'text-[#B7D31A] fill-[#B7D31A]' : 'text-[#1A1F21]')} />
                    ))}
                  </div>
                  <p className="text-sm text-[#C7C7C0]">{review.comment}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {review.active ? (
                      <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">Aprobada</span>
                    ) : (
                      <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Pendiente</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
