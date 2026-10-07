import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const logger = new Logger('OrderEmails');

/** Estados en los que el dinero ya entró. */
const COBRADOS = ['PAID', 'SHIPPED', 'DELIVERED'];

interface Antes {
  status: string;
  trackingNumber?: string | null;
}

export interface Aviso {
  /** Pasó de pendiente a cobrado: hay que registrar el cobro. */
  pasoAPagado: boolean;
  /** Mail "recibimos tu pago". */
  pagoRecibido: boolean;
  /** Mail "tu pedido fue despachado", con el seguimiento. */
  despachado: boolean;
}

/**
 * Qué se le avisa al cliente cuando la tienda cambia el estado de su pedido.
 *
 * - Pagado: "recibimos tu pago". Pasar directo de pendiente a enviado es
 *   "pagado y enviado": un solo mail, el de despacho, que ya implica el pago.
 * - Enviado: mail con el seguimiento. Se manda al pasar a Enviado y también si
 *   el pedido ya estaba enviado y la tienda corrige o carga el seguimiento;
 *   guardar lo mismo otra vez no manda nada.
 */
export function queAvisar(antes: Antes, nuevo: { status: string; trackingNumber?: string }): Aviso {
  const pasoAPagado = COBRADOS.includes(nuevo.status) && antes.status === 'PENDING';
  const cambioElSeguimiento = !!nuevo.trackingNumber && nuevo.trackingNumber !== (antes.trackingNumber || '');
  return {
    pasoAPagado,
    pagoRecibido: pasoAPagado && nuevo.status !== 'SHIPPED',
    despachado: nuevo.status === 'SHIPPED' && (antes.status !== 'SHIPPED' || cambioElSeguimiento),
  };
}

/**
 * Manda los mails que correspondan. Nunca lanza: el estado ya se guardó y un
 * mail que falla (clave, dominio, casilla inexistente) no puede deshacerlo.
 */
export async function avisarAlCliente(prisma: PrismaService, emails: EmailService, pedidoId: string, aviso: Aviso): Promise<void> {
  if (!aviso.pagoRecibido && !aviso.despachado) return;
  try {
    const pedido = await prisma.order.findUnique({
      where: { id: pedidoId },
      include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
    });
    if (!pedido) return;
    let notas: { buyerEmail?: string; buyerName?: string; shippingCarrier?: string } = {};
    try {
      notas = pedido.notes ? JSON.parse(pedido.notes) : {};
    } catch {
      notas = {};
    }
    const destino = notas.buyerEmail || pedido.user?.email;
    if (!destino) return;
    const nombre = notas.buyerName || pedido.user?.name || 'Cliente';
    const esRetiro = notas.shippingCarrier === 'retiro_local' || /retiro/i.test(pedido.address || '');

    if (aviso.pagoRecibido) {
      await emails.sendPaymentReceived(destino, {
        orderNumber: pedido.number,
        customerName: nombre,
        items: pedido.items.map((i) => ({ name: i.product?.name ?? 'Producto', quantity: i.quantity, price: i.price })),
        total: pedido.total,
        esRetiro,
      });
    }
    // Quien retira en el local no tiene envío: no se le manda "despachado".
    if (aviso.despachado && !esRetiro) {
      await emails.sendOrderShipped(destino, pedido.number, nombre, pedido.trackingNumber, pedido.trackingUrl);
    }
  } catch (err) {
    logger.error('No se pudo avisar al cliente del pedido ' + pedidoId + ': ' + err);
  }
}
