'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Loader2, Truck, XCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { limpiarBorrador } from './useCheckoutDraft';
import { Resultado, useOrderOutcome } from './useOrderOutcome';

const TEXTOS: Record<Exclude<Resultado, 'cargando'>, { titulo: string; detalle: string; borde: string }> = {
  aprobado: {
    titulo: '¡Pago aprobado!',
    detalle: 'Tu pago fue procesado y ya registramos el pedido. Te enviamos un email con los detalles.',
    borde: 'border-[#B7D31A]/30',
  },
  acreditando: {
    titulo: 'Pago realizado',
    detalle: 'Mercado Pago confirmó el pago y lo estamos registrando. Puede tardar unos segundos; no hace falta volver a pagar.',
    borde: 'border-[#B7D31A]/30',
  },
  pendiente: {
    titulo: 'Pago en proceso',
    detalle: 'Mercado Pago todavía no confirmó el pago. Te avisamos por email en cuanto se acredite.',
    borde: 'border-amber-500/30',
  },
  rechazado: {
    titulo: 'El pago no se completó',
    detalle: 'Mercado Pago no confirmó el cobro, así que no registramos el pedido. Podés intentar de nuevo o escribirnos.',
    borde: 'border-red-500/30',
  },
};

function Icono({ resultado }: { resultado: Resultado }) {
  if (resultado === 'cargando') return <Loader2 size={32} className="text-[#B7D31A] animate-spin" />;
  if (resultado === 'rechazado') return <XCircle size={32} className="text-red-500" />;
  if (resultado === 'pendiente') return <Clock size={32} className="text-amber-500" />;
  return <CheckCircle size={32} className="text-green-500" />;
}

/**
 * Pantalla de vuelta de Mercado Pago. Las tres rutas (success, pending, error)
 * la usan: el texto sale del estado real de la orden, no de la ruta.
 */
export default function CheckoutOutcome({ porDefecto }: { porDefecto: Resultado }) {
  const { resultado, orderNumber } = useOrderOutcome(porDefecto);
  const clearCart = useCartStore((s) => s.clearCart);
  const cobrado = resultado === 'aprobado' || resultado === 'acreditando';

  // El carrito nunca se vaciaba al pagar con Mercado Pago: quien volvía se
  // encontraba con todo adentro y podía terminar pagando dos veces.
  useEffect(() => {
    if (cobrado) { clearCart(); limpiarBorrador(); }
  }, [cobrado, clearCart]);

  const texto = resultado === 'cargando' ? null : TEXTOS[resultado];

  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center">
      <div className={'max-w-md w-full mx-4 bg-[#0F1111] rounded-2xl border p-10 text-center ' + (texto?.borde ?? 'border-[#0D0F0F]')}>
        <div className="w-16 h-16 bg-[#1A1F21] rounded-full flex items-center justify-center mx-auto mb-5">
          <Icono resultado={resultado} />
        </div>

        <h1 className="text-2xl font-black text-[#F7F6F7] mb-2">{texto?.titulo ?? 'Confirmando el pago...'}</h1>

        {orderNumber && (
          <>
            <p className="text-[#8A8A85] text-sm mb-1">Número de orden:</p>
            <p className="text-2xl font-black text-[#B7D31A] bg-[#1A1F21] px-6 py-2 rounded-lg mb-5 inline-block">#{orderNumber}</p>
          </>
        )}

        <p className="text-[#8A8A85] text-sm mb-8">{texto?.detalle ?? 'Estamos verificando el estado de tu pago con Mercado Pago.'}</p>

        <div className="flex flex-col gap-3">
          {cobrado && orderNumber && (
            <Link href={'/rastrear?order=' + orderNumber} className="bg-[#B7D31A] text-[#050606] py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors flex items-center justify-center gap-2">
              <Truck size={16} /> Rastrear pedido
            </Link>
          )}
          {resultado === 'rechazado' && (
            <Link href="/checkout" className="bg-[#B7D31A] text-[#050606] py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Intentar de nuevo</Link>
          )}
          <Link href="/" className="border border-[#0D0F0F] py-3 rounded-xl font-bold text-sm text-[#C7C7C0] hover:bg-[#0C0C0C] transition-colors">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
