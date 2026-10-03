import { CartItem } from '@/types';
import { trackMetaEvent, DatosComprador } from './metaPixel';
import { contenidoDeCarrito, firmaDeCarrito as firma } from './metaContenido';

const CLAVE = 'hp_inicio_checkout';

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
  trackMetaEvent('InitiateCheckout', contenidoDeCarrito(items), {}, undefined, comprador);
}
