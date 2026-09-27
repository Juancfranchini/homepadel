'use client';

import { useEffect, useRef } from 'react';
import { CartItem } from '@/types';
import { trackMetaEvent, DatosComprador } from '@/lib/metaPixel';

/**
 * Avisa a Meta que alguien empezó el checkout.
 *
 * Es el paso previo a la compra y el que Meta usa para optimizar las campañas:
 * con este evento aprende a quién mostrarle los anuncios. Estaba declarado en
 * la configuración del backoffice pero no se disparaba en ningún lado, así que
 * la cuenta publicitaria no lo recibía nunca.
 *
 * Se manda una sola vez por visita, aunque después se edite el carrito.
 */
export function useInitiateCheckout(items: CartItem[], subtotal: number, comprador?: DatosComprador): void {
  const avisado = useRef(false);
  // En una referencia: el evento sale una sola vez y que cambien los datos no lo vuelve a disparar.
  const datosComprador = useRef(comprador);
  datosComprador.current = comprador;

  useEffect(() => {
    if (avisado.current || items.length === 0) return;
    avisado.current = true;

    trackMetaEvent('InitiateCheckout', {
      currency: 'ARS',
      value: subtotal,
      num_items: items.reduce((acc, item) => acc + item.quantity, 0),
      content_ids: items.map((item) => item.product.id),
      content_type: 'product',
    }, {}, undefined, datosComprador.current);
  }, [items, subtotal]);
}
