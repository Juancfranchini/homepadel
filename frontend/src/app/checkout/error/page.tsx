'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-[#0F1111] rounded-2xl border border-red-500/30 p-10 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-[#F7F6F7] mb-2">Error en el pago</h1>
        <p className="text-[#8A8A85] text-sm mb-8">Hubo un problema al procesar tu pago. Intenta de nuevo o contactanos.</p>
        <div className="flex flex-col gap-3">
          <Link href="/checkout" className="bg-[#B7D31A] text-[#050606] py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Intentar de nuevo</Link>
          <Link href="/" className="border border-[#0D0F0F] py-3 rounded-xl font-bold text-sm text-[#C7C7C0] hover:bg-[#0C0C0C] transition-colors">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
