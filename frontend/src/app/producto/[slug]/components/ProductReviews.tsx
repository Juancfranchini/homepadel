'use client';

import { useState, useEffect } from 'react';
import { Star, User, CheckCircle } from 'lucide-react';
import OverallCustomerOpinions from './OverallCustomerOpinions';

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

  return (
    <section className="border-t border-[#0D0F0F] py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-6">
          LO QUE DICEN NUESTROS CLIENTES
        </h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[30%] flex-shrink-0">
            <OverallCustomerOpinions productId={productId} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#F7F6F7] mb-4">Resenas ({reviews.length})</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A1F21] flex items-center justify-center flex-shrink-0">
                      {review.photo ? <img src={review.photo} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-4 h-4 text-[#8A8A85]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-[#F7F6F7]">{review.name}</span>
                        {review.verified && <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full"><CheckCircle className="w-3 h-3 inline mr-0.5" />Verificado</span>}
                      </div>
                      <div className="flex gap-0.5 mb-1.5">
                        {[1,2,3,4,5].map((s) => <Star key={s} className={'w-3 h-3 ' + (s <= review.rating ? 'text-[#B7D31A] fill-[#B7D31A]' : 'text-[#1A1F21]')} />)}
                      </div>
                      <p className="text-sm text-[#C7C7C0] leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-[#8A8A85] mt-1.5">{new Date(review.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
