'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-[#0F1111] rounded-2xl border border-[#B7D31A]/30 p-10 text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={32} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-black text-[#F7F6F7] mb-2">Pago en proceso</h1>
        <p className="text-[#8A8A85] text-sm mb-8">Tu pago esta siendo procesado. Te notificaremos por email cuando se confirme.</p>
        <Link href="/" className="border border-[#0D0F0F] py-3 rounded-xl font-bold text-sm text-[#C7C7C0] hover:bg-[#0C0C0C] transition-colors block">Volver al inicio</Link>
      </div>
    </div>
  );
}
