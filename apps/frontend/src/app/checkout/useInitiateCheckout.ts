'use client';

import { useEffect, useRef } from 'react';
import { CartItem } from '@/types';
import { DatosComprador } from '@/lib/metaPixel';
import { avisarInicioDeCheckout } from '@/lib/inicioCheckout';

/**
 * InitiateCheckout para quien llega al checkout sin pasar por "Finalizar
 * compra" (link de venta, volver atrás, recargar). Si ya se avisó con este
 * carrito al tocar el botón, no se repite (ver lib/inicioCheckout.ts).
 */
export function useInitiateCheckout(items: CartItem[], comprador?: DatosComprador): void {
  // En referencias: el aviso sale al aparecer el carrito, no cada vez que cambian estos datos.
  const datos = useRef({ items, comprador });
  datos.current = { items, comprador };
  const hayItems = items.length > 0;

  useEffect(() => {
    if (hayItems) avisarInicioDeCheckout(datos.current.items, datos.current.comprador);
  }, [hayItems]);
}
