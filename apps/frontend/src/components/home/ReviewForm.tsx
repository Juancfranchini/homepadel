'use client';

import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Star, Send } from 'lucide-react';
import api from '@/lib/api';

const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Escribí tu nombre').max(80, 'El nombre es demasiado largo'),
  comment: z.string().trim().min(10, 'Contanos un poco más sobre tu experiencia').max(1000, 'La reseña admite hasta 1000 caracteres'),
  rating: z.number().int().min(1).max(5),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Props {
  productId?: string;
  onClose: () => void;
}

function RatingPicker({ value, hover, onSelect, onHover }: {
  value: number;
  hover: number;
  onSelect: (rating: number) => void;
  onHover: (rating: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Puntuación">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" role="radio" aria-checked={value === star} aria-label={`${star} estrellas`}
          onClick={() => onSelect(star)} onMouseEnter={() => onHover(star)} onMouseLeave={() => onHover(0)} className="transition-colors">
          <Star className={'w-7 h-7 ' + (star <= (hover || value) ? 'text-[#B7D31A] fill-[#B7D31A]' : 'text-[#8A8A85]')} />
        </button>
      ))}
    </div>
  );
}

function PendingMessage({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-[#141A1D] border border-[#0D0F0F] rounded-2xl p-8 text-center animate-slide-up">
      <div className="w-14 h-14 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center mx-auto mb-4"><Send className="w-6 h-6 text-[#B7D31A]" /></div>
      <h4 className="text-[#F7F6F7] font-semibold text-lg mb-2">Reseña recibida</h4>
      <p className="text-[#C7C7C0] text-sm mb-4">Se guardó correctamente y quedó pendiente de moderación. La publicaremos cuando sea aprobada.</p>
      <button onClick={onClose} className="text-[#B7D31A] text-sm font-semibold hover:underline">Cerrar</button>
    </div>
  );
}

function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401) return 'Iniciá sesión para dejar una reseña de producto.';
    if (typeof error.response?.data?.message === 'string') return error.response.data.message;
  }
  return 'No pudimos guardar tu reseña. Intentá nuevamente.';
}

export default function ReviewForm({ productId, onClose }: Props) {
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');
  const [hoverStar, setHoverStar] = useState(0);
  const form = useForm<ReviewFormData>({ resolver: zodResolver(reviewSchema), defaultValues: { name: '', comment: '', rating: 5 } });
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
  const rating = watch('rating');
  const commentPlaceholder = productId
    ? 'Contanos tu experiencia con el producto'
    : 'Contanos tu experiencia con Home Pádel';

  const onSubmit = async (data: ReviewFormData) => {
    setApiError('');
    try {
      const endpoint = productId ? '/reviews' : '/testimonials/public';
      await api.post(endpoint, productId ? { ...data, productId } : data);
      setSent(true);
    } catch (error: unknown) {
      setApiError(errorMessage(error));
    }
  };

  if (sent) return <PendingMessage onClose={onClose} />;

  return (
    <div className="bg-[#141A1D] border border-[#0D0F0F] rounded-2xl p-6 md:p-8 animate-slide-up">
      <div className="flex items-center justify-between mb-6"><h4 className="text-[#F7F6F7] font-semibold text-lg">Dejá tu reseña</h4><button onClick={onClose} aria-label="Cerrar" className="text-[#8A8A85] hover:text-[#F7F6F7] transition-colors"><X className="w-5 h-5" /></button></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div><label htmlFor="review-name" className="block text-sm font-medium text-[#F7F6F7] mb-2">Tu nombre</label><input id="review-name" {...register('name')} type="text" autoComplete="name" placeholder="Escribí tu nombre" className="w-full px-4 py-3 bg-[#0A0F12] border border-[#0D0F0F] rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]" />{errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}</div>
        <div><p className="block text-sm font-medium text-[#F7F6F7] mb-2">Puntuación</p><RatingPicker value={rating} hover={hoverStar} onSelect={(value) => setValue('rating', value, { shouldValidate: true })} onHover={setHoverStar} /></div>
        <div><label htmlFor="review-comment" className="block text-sm font-medium text-[#F7F6F7] mb-2">Tu comentario</label><textarea id="review-comment" {...register('comment')} rows={4} placeholder={commentPlaceholder} className="w-full px-4 py-3 bg-[#0A0F12] border border-[#0D0F0F] rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] resize-none" />{errors.comment && <p className="text-red-400 text-xs mt-1">{errors.comment.message}</p>}</div>
        {apiError && <p className="text-red-400 text-xs">{apiError}</p>}
        <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-[#B7D31A] text-[#050606] rounded-xl font-semibold text-sm uppercase tracking-wider btn-primary-glow disabled:opacity-50">{isSubmitting ? 'Enviando...' : 'Enviar reseña'}</button>
      </form>
    </div>
  );
}
