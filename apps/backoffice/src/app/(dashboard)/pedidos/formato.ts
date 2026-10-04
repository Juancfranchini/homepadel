import type { Etapa, Pedido } from './tipos';

/**
 * Cómo se lee un pedido en el panel: estado del pago, forma y estado de la
 * entrega, y en qué etapa de trabajo está. Todo sale de los datos reales del
 * pedido; lo que no está cargado no se inventa.
 */

export interface Insignia {
  texto: string;
  /** Clases de Tailwind del color de la insignia. */
  color: string;
}

const VERDE = 'bg-green-50 text-green-700 border-green-200';
const AMBAR = 'bg-amber-50 text-amber-700 border-amber-200';
const AZUL = 'bg-blue-50 text-blue-700 border-blue-200';
const VIOLETA = 'bg-purple-50 text-purple-700 border-purple-200';
const ROJO = 'bg-red-50 text-red-700 border-red-200';
const GRIS = 'bg-gray-50 text-gray-600 border-gray-200';

/** Lo que guarda el pedido en `notes` (JSON) al crearse. */
export function notasDe(pedido: Pedido): Record<string, unknown> {
  try {
    const datos = pedido.notes ? JSON.parse(pedido.notes) : {};
    return datos && typeof datos === 'object' ? datos : {};
  } catch {
    return {};
  }
}

const COBRADO = ['PAID', 'SHIPPED', 'DELIVERED'];

export function estadoDelPago(pedido: Pedido): Insignia {
  if (pedido.status === 'CANCELLED') return { texto: 'Cancelado', color: ROJO };
  if (pedido.paymentStatus === 'REFUNDED') return { texto: 'Reintegrado', color: GRIS };
  if (pedido.paymentStatus === 'PARTIALLY_REFUNDED') return { texto: 'Reintegro parcial', color: AMBAR };
  if (pedido.paymentStatus === 'PARTIAL') return { texto: 'Pago parcial', color: AMBAR };
  // Pedidos viejos marcados Pagado a mano quedaban con el cobro "pendiente":
  // si el pedido ya avanzó, la plata entró.
  if (pedido.paymentStatus === 'PAID' || COBRADO.includes(pedido.status)) return { texto: 'Recibido', color: VERDE };
  return { texto: 'Por cobrar', color: AMBAR };
}

const MEDIOS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  transfer: 'Transferencia',
  MERCADOPAGO: 'Mercado Pago',
  TRANSFER: 'Transferencia',
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  DIGITAL_WALLET: 'Billetera virtual',
  EXTERNAL_TERMINAL: 'Posnet',
};

export function medioDePago(pedido: Pedido): string {
  const cobrados = (pedido.payments || []).filter((p) => p.kind !== 'REFUND' && p.status !== 'VOIDED');
  const deLosCobros = [...new Set(cobrados.map((p) => MEDIOS[p.method] || p.method))];
  if (deLosCobros.length > 0) return deLosCobros.join(' + ');
  const elegido = String(pedido.paymentMethod || notasDe(pedido).paymentMethod || '');
  if (MEDIOS[elegido]) return MEDIOS[elegido];
  // La tienda online cobra por transferencia (que siempre queda anotada) o por
  // Mercado Pago, que no anota el medio hasta acreditarse: el resto es Mercado Pago.
  return pedido.channel && pedido.channel !== 'ONLINE' ? 'A cobrar en el local' : 'Mercado Pago';
}

const TRANSPORTES: Record<string, string> = {
  retiro_local: 'Retiro en el local',
  correo_argentino: 'Correo Argentino',
  andreani: 'Andreani',
  oca: 'OCA',
  flex: 'Envío Flex (moto)',
};

/** Forma de entrega elegida. Las ventas del local sin transportista son retiro. */
export function formaDeEntrega(pedido: Pedido): { texto: string; esRetiro: boolean } {
  const transporte = String(notasDe(pedido).shippingCarrier || '');
  if (TRANSPORTES[transporte]) return { texto: TRANSPORTES[transporte], esRetiro: transporte === 'retiro_local' };
  if (/retiro/i.test(pedido.address || '')) return { texto: 'Retiro en el local', esRetiro: true };
  return { texto: pedido.channel && pedido.channel !== 'ONLINE' ? 'Envío a coordinar' : 'Correo Argentino', esRetiro: false };
}

export function estadoDeEntrega(pedido: Pedido): Insignia {
  const { esRetiro } = formaDeEntrega(pedido);
  switch (pedido.status) {
    case 'CANCELLED': return { texto: 'Cancelado', color: ROJO };
    case 'DELIVERED': return { texto: esRetiro ? 'Retirado' : 'Entregado', color: VERDE };
    case 'SHIPPED': return { texto: 'Enviado', color: VIOLETA };
    case 'PAID': return { texto: esRetiro ? 'Por retirar' : 'Por enviar', color: AZUL };
    default: return { texto: 'Esperando el pago', color: GRIS };
  }
}

export function etapaDe(pedido: Pedido): Exclude<Etapa, 'todos'> {
  switch (pedido.status) {
    case 'CANCELLED': return 'cancelados';
    case 'DELIVERED': return 'entregados';
    case 'SHIPPED': return 'enviados';
    case 'PAID': return formaDeEntrega(pedido).esRetiro ? 'retirar' : 'enviar';
    default: return 'cobrar';
  }
}

export const ETAPAS: { valor: Etapa; texto: string }[] = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'cobrar', texto: 'Por cobrar' },
  { valor: 'enviar', texto: 'Por enviar' },
  { valor: 'retirar', texto: 'Por retirar' },
  { valor: 'enviados', texto: 'Enviados' },
  { valor: 'entregados', texto: 'Entregados' },
  { valor: 'cancelados', texto: 'Cancelados' },
];

export const nombreCliente = (p: Pedido) => p.buyerName || p.user?.name || 'Sin nombre';
export const mailCliente = (p: Pedido) => p.buyerEmail || p.user?.email || '';

/** "23 sep 19:11", en hora argentina. */
export function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  const dia = fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).replace('.', '');
  const hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' });
  return dia + ' ' + hora;
}

export const unidades = (p: Pedido) => (p.items || []).reduce((acc, i) => acc + i.quantity, 0);

/** Busca por número, nombre, mail o teléfono, sin importar mayúsculas ni tildes. */
export function coincideBusqueda(pedido: Pedido, texto: string): boolean {
  const limpiar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const buscado = limpiar(texto.trim());
  if (!buscado) return true;
  const campos = [pedido.number, nombreCliente(pedido), mailCliente(pedido), pedido.buyerPhone || ''];
  if (campos.some((c) => limpiar(c).includes(buscado))) return true;
  // Teléfono sin importar espacios ni guiones, solo si lo buscado es un número
  // de al menos 4 dígitos: si no, "cliente5" encontraba cualquier teléfono con un 5.
  const digitos = buscado.replace(/[\s-]/g, '');
  return /^\+?\d{4,}$/.test(digitos) && (pedido.buyerPhone || '').replace(/\D/g, '').includes(digitos.replace(/\D/g, ''));
}

/** Link de WhatsApp al cliente (solo dígitos, con 54 si falta). */
export function whatsappDe(telefono?: string | null): string | null {
  const digitos = (telefono || '').replace(/\D/g, '');
  if (digitos.length < 8) return null;
  return 'https://wa.me/' + (digitos.startsWith('54') ? digitos : '549' + digitos.replace(/^0/, ''));
}
