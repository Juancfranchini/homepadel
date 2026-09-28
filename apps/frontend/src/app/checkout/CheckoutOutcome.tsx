'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { trackMetaEvent } from '@/lib/metaPixel';
import { limpiarBorrador } from './useCheckoutDraft';
import { Resultado, useOrderOutcome } from './useOrderOutcome';

const TEXTOS: Record<Exclude<Resultado, 'cargando'>, { titulo: string; detalle: string; borde: string }> = {
  aprobado: {
    titulo: '¡Pago aprobado!',
    // Sin prometer un email: el envío de correos no está en servicio.
    detalle: 'Tu pago fue procesado y ya registramos el pedido. Guardá el número de orden; nos comunicamos con vos para coordinar el envío.',
    borde: 'border-[#B7D31A]/30',
  },
  acreditando: {
    titulo: 'Pago realizado',
    detalle: 'Mercado Pago confirmó el pago y lo estamos registrando. Puede tardar unos segundos; no hace falta volver a pagar.',
    borde: 'border-[#B7D31A]/30',
  },
  pendiente: {
    titulo: 'Pago en proceso',
    detalle: 'Mercado Pago todavía no confirmó el pago. Guardá el número de orden y consultanos si no se acredita.',
    borde: 'border-amber-500/30',
  },
  rechazado: {
    titulo: 'El pago no se completó',
    detalle: 'Mercado Pago no confirmó el cobro, así que no registramos el pedido. Podés intentar de nuevo o escribirnos.',
    borde: 'border-red-500/30',
  },
};

function Icono({ resultado }: { resultado: Resultado }) {
  if (resultado === 'cargando') return <Loader2 size={32} className="text-brand-fg animate-spin" />;
  if (resultado === 'rechazado') return <XCircle size={32} className="text-red-500 light:text-red-600" />;
  if (resultado === 'pendiente') return <Clock size={32} className="text-amber-500 light:text-amber-700" />;
  return <CheckCircle size={32} className="text-green-500 light:text-green-700" />;
}

/**
 * Pantalla de vuelta de Mercado Pago. Las tres rutas (success, pending, error)
 * la usan: el texto sale del estado real de la orden, no de la ruta.
 */
export default function CheckoutOutcome({ porDefecto }: { porDefecto: Resultado }) {
  const { resultado, orderNumber, orden } = useOrderOutcome(porDefecto);
  const clearCart = useCartStore((s) => s.clearCart);
  const cobrado = resultado === 'aprobado' || resultado === 'acreditando';
  const purchaseAvisado = useRef(false);

  // El carrito nunca se vaciaba al pagar con Mercado Pago: quien volvía se
  // encontraba con todo adentro y podía terminar pagando dos veces.
  useEffect(() => {
    if (cobrado) { clearCart(); limpiarBorrador(); }
  }, [cobrado, clearCart]);

  // El mismo id que usa el servidor (PaymentsService / enviarCompraAMeta):
  // Meta lo trata como un solo evento en vez de dos, aunque llegue por dos
  // caminos. Antes esto solo se avisaba desde el servidor: el pixel del
  // navegador nunca reportaba la compra, y esa señal es la que más pesa para
  // la calidad de la medición.
  useEffect(() => {
    if (!cobrado || !orden || purchaseAvisado.current) return;
    purchaseAvisado.current = true;
    // Una compra de prueba no se informa: el servidor tampoco la manda.
    if (orden.isTest) return;
    trackMetaEvent(
      'Purchase',
      { content_ids: orden.items.map((i) => i.productId), content_type: 'product', value: orden.total, currency: 'ARS' },
      {},
      // El email y el teléfono del comprador los agrega el servidor desde la orden.
      'purchase_' + orderNumber,
    );
  }, [cobrado, orden, orderNumber]);

  const texto = resultado === 'cargando' ? null : TEXTOS[resultado];

  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className={'max-w-md w-full mx-4 bg-card rounded-2xl border p-10 text-center ' + (texto?.borde ?? 'border-line')}>
        <div className="w-16 h-16 bg-chip rounded-full flex items-center justify-center mx-auto mb-5">
          <Icono resultado={resultado} />
        </div>

        <h1 className="text-2xl font-black text-fg mb-2">{texto?.titulo ?? 'Confirmando el pago...'}</h1>

        {orderNumber && (
          <>
            <p className="text-fg-muted text-sm mb-1">Número de orden:</p>
            <p className="text-2xl font-black text-brand-fg bg-chip px-6 py-2 rounded-lg mb-5 inline-block">#{orderNumber}</p>
          </>
        )}

        <p className="text-fg-muted text-sm mb-8">{texto?.detalle ?? 'Estamos verificando el estado de tu pago con Mercado Pago.'}</p>

        <div className="flex flex-col gap-3">
          {resultado === 'rechazado' && (
            <Link href="/checkout" className="bg-[#B7D31A] text-[#050606] py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Intentar de nuevo</Link>
          )}
          <Link href="/" className="border border-line py-3 rounded-xl font-bold text-sm text-fg-soft hover:bg-panel transition-colors">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
