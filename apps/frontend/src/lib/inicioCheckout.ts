import { CartItem } from '@/types';
import { trackMetaEvent, DatosComprador } from './metaPixel';

const CLAVE = 'hp_inicio_checkout';

/** Mismos productos y cantidades: el mismo inicio de checkout. */
function firma(items: CartItem[]): string {
  return items.map((i) => `${i.product.id}:${i.variantId ?? ''}:${i.quantity}`).sort().join('|');
}

/**
 * InitiateCheckout: alguien quiere pagar lo que tiene en el carrito.
 *
 * Sale al tocar "Finalizar compra" (carrito o panel lateral), antes de pedir
 * que inicie sesión. Antes salía recién al entrar al checkout, después del
 * login, y quien se iba en esa pantalla no contaba: por eso casi no
 * aparecía. Quien entra directo a /checkout (link de venta, volver atrás) lo
 * dispara ahí (ver useInitiateCheckout).
 *
 * Una sola vez por carrito en la visita: volver al checkout con el mismo
 * carrito no lo repite; cambiarlo, sí.
 */
export function avisarInicioDeCheckout(items: CartItem[], comprador?: DatosComprador): void {
  if (items.length === 0) return;
  const actual = firma(items);
  try {
    if (sessionStorage.getItem(CLAVE) === actual) return;
    sessionStorage.setItem(CLAVE, actual);
  } catch {
    // Sin almacenamiento: se avisa igual.
  }
  trackMetaEvent('InitiateCheckout', {
    currency: 'ARS',
    value: items.reduce((acc, i) => acc + i.product.effectivePrice * i.quantity, 0),
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    content_ids: items.map((i) => i.product.id),
    content_type: 'product',
  }, {}, undefined, comprador);
}
