/**
 * Id fijo del intento de compra con Mercado Pago en esta pestaña. El servidor
 * lo usa para no crear otro pedido si se reintenta con el mismo carrito
 * (volver de un pago rechazado, volver atrás desde Mercado Pago, doble clic):
 * reusa la misma preferencia. Se olvida al confirmarse el pago.
 */

const CLAVE = 'hp_checkout_intento';

export function idDeIntento(): string | undefined {
  try {
    let id = sessionStorage.getItem(CLAVE);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^\w-]/g, '');
      sessionStorage.setItem(CLAVE, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function olvidarIntento(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar.
  }
}

/** Número de pedido si el servidor dice que ese intento ya se pagó (409 `yaPagado`). */
export function pedidoYaPagado(err: unknown): string | null {
  const data = (err as { response?: { status?: number; data?: { yaPagado?: boolean; orderNumber?: string } } })?.response;
  return data?.status === 409 && data.data?.yaPagado && data.data.orderNumber ? data.data.orderNumber : null;
}
