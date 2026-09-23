'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmPayment, trackOrder } from '@/lib/api';

export type Resultado = 'cargando' | 'aprobado' | 'acreditando' | 'pendiente' | 'rechazado';

/** Estados de la orden que significan que el dinero ya entró. */
const ESTADOS_COBRADOS = ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

const INTENTOS = 5;
const ESPERA_MS = 3000;

/**
 * Traduce lo que dice Mercado Pago en la URL de vuelta. Manda `status` en las
 * integraciones nuevas y `collection_status` en las viejas.
 */
function segunMercadoPago(params: URLSearchParams): Resultado | null {
  const estado = params.get('status') || params.get('collection_status');
  if (!estado) return null;
  if (estado === 'approved') return 'acreditando';
  if (estado === 'rejected' || estado === 'cancelled') return 'rechazado';
  if (estado === 'pending' || estado === 'in_process' || estado === 'authorized') return 'pendiente';
  return null;
}

/**
 * Resuelve qué pasó realmente con el pago.
 *
 * Las tres pantallas de vuelta afirmaban un resultado fijo por la ruta a la
 * que Mercado Pago hubiera redirigido: /checkout/error decía "Error en el
 * pago" aunque el pago estuviera acreditado. Acá el resultado sale de la
 * orden en el servidor y, si todavía no llegó el aviso de pago, de lo que
 * informa Mercado Pago en la URL. `porDefecto` es solo lo que se asume
 * mientras no haya ningún dato mejor.
 */
export function useOrderOutcome(porDefecto: Resultado): { resultado: Resultado; orderNumber: string } {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || searchParams.get('external_reference') || '';
  const [resultado, setResultado] = useState<Resultado>('cargando');

  useEffect(() => {
    const deMercadoPago = segunMercadoPago(new URLSearchParams(searchParams.toString()));

    if (!orderNumber) {
      setResultado(deMercadoPago ?? porDefecto);
      return;
    }

    let vigente = true;
    let intento = 0;
    let temporizador: ReturnType<typeof setTimeout>;

    const consultar = async () => {
      try {
        // Se le pide al servidor que consulte el pago en Mercado Pago y
        // registre la venta. No se espera el aviso de Mercado Pago: es un
        // solo canal de entrega y si falla la orden queda en pendiente para
        // siempre, con el stock sin descontar. Si el aviso ya llegó, esto no
        // hace nada: la confirmación es idempotente.
        await confirmPayment(orderNumber).catch(() => {});
        if (!vigente) return;

        const orden = await trackOrder(orderNumber);
        if (!vigente) return;

        if (ESTADOS_COBRADOS.includes(orden?.status)) {
          setResultado('aprobado');
          return;
        }
        if (orden?.status === 'CANCELLED') {
          setResultado('rechazado');
          return;
        }
        // Sigue PENDING: el aviso de pago de Mercado Pago llega unos segundos
        // después de devolver al comprador, así que se reintenta un rato
        // antes de dar una respuesta.
        setResultado(deMercadoPago ?? porDefecto);
        if (deMercadoPago !== 'rechazado' && ++intento < INTENTOS) {
          temporizador = setTimeout(consultar, ESPERA_MS);
        }
      } catch {
        // La orden no existe o el servidor no responde: se muestra lo que
        // haya dicho Mercado Pago, y si tampoco hay eso, el valor de la ruta.
        if (vigente) setResultado(deMercadoPago ?? porDefecto);
      }
    };

    consultar();
    return () => { vigente = false; clearTimeout(temporizador); };
  }, [orderNumber, porDefecto, searchParams]);

  return { resultado, orderNumber };
}
