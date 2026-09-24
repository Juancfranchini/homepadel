'use client';

import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCartFeedbackStore } from '@/store/cartFeedbackStore';

export default function CartAddedFeedback() {
  const addedItem = useCartFeedbackStore((state) => state.addedItem);
  const clearAdded = useCartFeedbackStore((state) => state.clearAdded);

  useEffect(() => {
    if (!addedItem) return;
    const timeout = window.setTimeout(() => clearAdded(addedItem.sequence), 1800);
    return () => window.clearTimeout(timeout);
  }, [addedItem, clearAdded]);

  if (!addedItem) return null;

  return (
    <div
      key={addedItem.sequence}
      role="status"
      aria-live="polite"
      className="animate-slide-in fixed right-4 top-20 z-[150] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-[#B7D31A]/40 bg-[#151A1C] px-4 py-3 text-[#F7F6F7] shadow-2xl shadow-black/50 sm:right-6"
    >
      <CheckCircle2 size={21} className="flex-none text-[#B7D31A]" />
      <div className="min-w-0">
        <p className="text-sm font-bold">Agregado al carrito</p>
        <p className="truncate text-xs text-[#C7C7C0]">{addedItem.quantity} × {addedItem.name}</p>
      </div>
    </div>
  );
}
