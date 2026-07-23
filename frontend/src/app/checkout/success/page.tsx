'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-[#0F1111] rounded-2xl border border-[#B7D31A]/30 p-10 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-[#F7F6F7] mb-2">Pago aprobado!</h1>
        <p className="text-[#8A8A85] text-sm mb-1">Numero de orden:</p>
        <p className="text-2xl font-black text-[#B7D31A] bg-[#1A1F21] px-6 py-2 rounded-lg mb-5 inline-block">#{orderNumber}</p>
        <p className="text-[#8A8A85] text-sm mb-8">Tu pago fue procesado exitosamente. Te enviamos un email con los detalles.</p>
        <div className="flex flex-col gap-3">
          <Link href={'/rastrear?order=' + orderNumber} className="bg-[#B7D31A] text-[#050606] py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors flex items-center justify-center gap-2">
            <Truck size={16} /> Rastrear pedido
          </Link>
          <Link href="/" className="border border-[#0D0F0F] py-3 rounded-xl font-bold text-sm text-[#C7C7C0] hover:bg-[#0C0C0C] transition-colors">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
