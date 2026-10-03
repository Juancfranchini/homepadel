import { CartItem } from '@/types';
import { trackMetaEvent } from './metaPixel';
import { guardarContacto } from './contactoComprador';

const CLAVE_PAGO = 'hp_datos_de_pago';

/** Mismos productos y cantidades: el mismo intento. */
export function firmaDeCarrito(items: CartItem[]): string {
  return items.map((i) => `${i.product.id}:${i.variantId ?? ''}:${i.quantity}`).sort().join('|');
}

/**
 * AddPaymentInfo: confirmó sus datos y va a pagar (Mercado Pago o
 * transferencia). Es el primer evento del embudo que siempre lleva mail y
 * teléfono, también para quien compra sin cuenta: lo que más sube la calidad
 * de coincidencia en Meta. Una vez por carrito: un reintento no lo duplica.
 */
export function avisarDatosDePago(items: CartItem[], email: string, telefono: string, medio: 'mercadopago' | 'transfer'): void {
  if (items.length === 0) return;
  guardarContacto(email, telefono);
  const firma = firmaDeCarrito(items) + '#' + medio;
  try {
    if (sessionStorage.getItem(CLAVE_PAGO) === firma) return;
    sessionStorage.setItem(CLAVE_PAGO, firma);
  } catch {
    // Sin almacenamiento: se avisa igual.
  }
  trackMetaEvent('AddPaymentInfo', contenidoDeCarrito(items), {}, undefined, { email, phone: telefono });
}

/**
 * Datos de producto de los eventos de Meta (InitiateCheckout, AddPaymentInfo),
 * armados igual en todos lados. Los `content_ids` y los `contents[].id` son
 * el mismo `product.id` que el feed del catálogo (/api/catalog-feed/meta.csv):
 * si no coinciden, Meta no une el evento con su producto.
 */
export function contenidoDeCarrito(items: CartItem[]) {
  return {
    currency: 'ARS',
    value: items.reduce((acc, i) => acc + i.product.effectivePrice * i.quantity, 0),
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    content_ids: [...new Set(items.map((i) => i.product.id))],
    content_type: 'product',
    contents: items.map((i) => ({ id: i.product.id, quantity: i.quantity, item_price: i.product.effectivePrice })),
  };
}
