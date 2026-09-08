'use client';

import { useState } from 'react';
import { X, Star, Send } from 'lucide-react';

interface Props {
  productId?: string;
  onClose: () => void;
}

export default function ReviewForm({ productId, onClose }: Props) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError('Completa tu nombre y comentario');
      return;
    }
    setSending(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const endpoint = productId ? '/reviews' : '/testimonials/public';
      await fetch(apiUrl + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, comment, rating, productId }),
      });
      setSent(true);
    } catch {
      setError('Error al enviar. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-[#141A1D] border border-[#0D0F0F] rounded-2xl p-8 text-center animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center mx-auto mb-4">
          <Send className="w-6 h-6 text-[#B7D31A]" />
        </div>
        <h4 className="text-[#F7F6F7] font-semibold text-lg mb-2">reseña enviada</h4>
        <p className="text-[#C7C7C0] text-sm mb-4">Tu comentario sera revisado y publicado pronto.</p>
        <button onClick={onClose} className="text-[#B7D31A] text-sm font-semibold hover:underline">Cerrar</button>
      </div>
    );
  }

  return (
    <div className="bg-[#141A1D] border border-[#0D0F0F] rounded-2xl p-6 md:p-8 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[#F7F6F7] font-semibold text-lg">Deja tu reseña</h4>
        <button onClick={onClose} className="text-[#8A8A85] hover:text-[#F7F6F7] transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#F7F6F7] mb-2">Tu nombre</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te llamas?"
            className="w-full px-4 py-3 bg-[#0A0F12] border border-[#0D0F0F] rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#F7F6F7] mb-2">Puntuacion</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverStar(star)} onMouseLeave={() => setHoverStar(0)} className="transition-colors">
                <Star className={'w-7 h-7 ' + (star <= (hoverStar || rating) ? 'text-[#B7D31A] fill-[#B7D31A]' : 'text-[#8A8A85]')} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#F7F6F7] mb-2">Tu comentario</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Contanos tu experiencia..."
            className="w-full px-4 py-3 bg-[#0A0F12] border border-[#0D0F0F] rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all resize-none" />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={sending}
          className="w-full py-3.5 bg-[#B7D31A] text-[#050606] rounded-xl font-semibold text-sm uppercase tracking-wider btn-primary-glow disabled:opacity-50 transition-all">
          {sending ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </form>
    </div>
  );
}
