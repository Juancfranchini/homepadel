import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { userDataParaMeta } from '../common/meta-user-data';
import { esCuentaDePrueba } from '../common/test-accounts';

const logger = new Logger('MetaPurchase');

interface ItemComprado {
  productId: string;
  quantity: number;
  price: number;
}

export interface CompraParaMeta {
  orderNumber: string;
  items: ItemComprado[];
  /** Lo que efectivamente se cobró. Si falta, se suma precio × cantidad. */
  valor?: number | null;
  emails?: (string | null | undefined)[];
  telefono?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  frontendUrl: string;
}

/**
 * Una compra de prueba no se informa: Meta optimiza los anuncios con estas
 * compras, y una que nunca existió le enseña a buscar al público equivocado.
 * Cuenta la marca de la orden y también los mails, por si la orden todavía
 * no la tiene (el mail de la cuenta de Mercado Pago se conoce recién al pagar).
 */
async function esCompraDePrueba(prisma: PrismaService, compra: CompraParaMeta): Promise<boolean> {
  const orden = await prisma.order.findUnique({ where: { number: compra.orderNumber }, select: { isTest: true } });
  return !!orden?.isTest || esCuentaDePrueba(prisma, compra.emails ?? []);
}

/**
 * Informa la compra a la API de Conversiones de Meta.
 *
 * Vive fuera de PaymentsService porque no es parte del cobro: si esto falla,
 * la venta ya está hecha y registrada. Por eso no propaga el error, solo lo
 * deja en el log.
 *
 * El `event_id` es `purchase_<número de orden>`, el mismo que usa el
 * navegador: Meta cuenta una sola compra aunque llegue por los dos caminos,
 * o dos veces por el mismo.
 */
export async function enviarCompraAMeta(prisma: PrismaService, compra: CompraParaMeta): Promise<void> {
  try {
    if (await esCompraDePrueba(prisma, compra)) {
      logger.log(`Compra de prueba ${compra.orderNumber}: no se informa a Meta.`);
      return;
    }
    const seccion = await prisma.siteSection.findUnique({ where: { key: 'meta_pixel' } });
    const config = (seccion?.data as { pixelId?: string; accessToken?: string; testEventCode?: string }) || {};
    if (!config.pixelId || !config.accessToken) return;

    const valor = compra.valor || compra.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    const payload: Record<string, unknown> = {
      access_token: config.accessToken,
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: 'purchase_' + compra.orderNumber,
        event_source_url: compra.frontendUrl + '/checkout/success?order=' + compra.orderNumber,
        action_source: 'website',
        user_data: userDataParaMeta({ emails: compra.emails, telefono: compra.telefono, ip: compra.ip, userAgent: compra.userAgent }),
        custom_data: {
          currency: 'ARS',
          value: valor,
          content_ids: compra.items.map((item) => item.productId),
          content_type: 'product',
          contents: compra.items.map((item) => ({
            id: item.productId,
            quantity: item.quantity,
            item_price: Number(item.price),
          })),
        },
      }],
    };

    if (config.testEventCode) payload.test_event_code = config.testEventCode;

    const respuesta = await fetch('https://graph.facebook.com/v21.0/' + config.pixelId + '/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!respuesta.ok) {
      logger.warn(`Meta rechazó el evento Purchase de ${compra.orderNumber} (HTTP ${respuesta.status}): ${await respuesta.text()}`);
    }
  } catch (err) {
    logger.error(`No se pudo informar la compra ${compra.orderNumber} a Meta: ${err}`);
  }
}

/**
 * Compra por transferencia de la tienda online que pasó a pagada.
 *
 * Mercado Pago se informa solo al acreditarse; la transferencia la confirma
 * alguien de la tienda a mano (en Pedidos o en el Punto de Venta), así que
 * hasta ahora nunca llegaba a Meta. Las ventas del local o de redes cargadas
 * en el Punto de Venta no son compras del sitio y no se informan.
 */
export async function informarTransferenciaPagadaAMeta(prisma: PrismaService, orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.channel !== 'ONLINE') return;

  let notas: { paymentMethod?: string; buyerEmail?: string; buyerPhone?: string } = {};
  try {
    notas = order.notes ? JSON.parse(order.notes) : {};
  } catch {
    return;
  }
  if (notas.paymentMethod !== 'transfer') return;

  await enviarCompraAMeta(prisma, {
    orderNumber: order.number,
    items: order.items.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
    valor: order.total,
    emails: [notas.buyerEmail],
    telefono: notas.buyerPhone,
    frontendUrl: (process.env.FRONTEND_URL || '').replace(/\/+$/, ''),
  });
}
