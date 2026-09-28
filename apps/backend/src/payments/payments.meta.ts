import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { userDataParaMeta } from '../common/meta/meta-user-data';
import { ClienteMeta } from '../common/meta/meta-cliente';
import { destinoMeta, enviarEventoAMeta, esOrigenDeProduccion, hostsDeProduccion, leerConfigMeta } from '../common/meta/meta-destino';
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
  /** Navegador de quien compró, guardado con el pedido (`notes.metaCliente`). */
  cliente?: ClienteMeta | null;
  /** IP y navegador que informe Mercado Pago, si el pedido no los tiene. */
  ip?: string | null;
  userAgent?: string | null;
  userId?: string | null;
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
 * Sitio desde el que se hizo el pedido. Los pedidos anteriores a que se
 * guardara (o la compra de Mercado Pago sin pedido encontrado) se toman como
 * de producción: son ventas reales de la tienda.
 */
function origenDeLaCompra(cliente?: ClienteMeta | null): string {
  return cliente?.origen || 'https://' + hostsDeProduccion()[0];
}

/**
 * Registra una compra confirmada: la suma al embudo del backoffice y la
 * informa a la API de Conversiones de Meta. Es el único lugar desde donde
 * sale el Purchase: el navegador ya no lo manda (la página de gracias se
 * puede recargar, cerrar antes de tiempo o no abrirse nunca).
 *
 * Mismas reglas que el resto de los eventos (ver track.controller.ts): una
 * compra de prueba no se cuenta ni se informa, y una hecha fuera de
 * producción no suma en el backoffice y a Meta va solo como prueba.
 *
 * Vive fuera de PaymentsService porque no es parte del cobro: si esto falla,
 * la venta ya está hecha y registrada. Por eso no propaga el error.
 *
 * El `event_id` es `purchase_<número de orden>`: si llega dos veces (aviso de
 * Mercado Pago y consulta de la tienda a la vez), Meta cuenta una sola.
 */
export async function enviarCompraAMeta(prisma: PrismaService, compra: CompraParaMeta): Promise<void> {
  try {
    if (await esCompraDePrueba(prisma, compra)) {
      logger.log(`Compra de prueba ${compra.orderNumber}: no se cuenta ni se informa a Meta.`);
      return;
    }
    const valor = compra.valor || compra.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
    const origen = origenDeLaCompra(compra.cliente);
    const produccion = esOrigenDeProduccion(origen);

    if (produccion) {
      await prisma.marketingEvent
        .create({ data: { eventName: 'Purchase', value: valor } })
        .catch((err) => logger.warn(`No se pudo sumar la compra ${compra.orderNumber} al embudo propio: ${err}`));
    }

    const destino = destinoMeta(await leerConfigMeta(prisma), produccion);
    if (!destino) return;

    await enviarEventoAMeta(destino, {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: 'purchase_' + compra.orderNumber,
      event_source_url: origen + '/checkout/success?order=' + compra.orderNumber,
      action_source: 'website',
      user_data: userDataParaMeta({
        emails: compra.emails,
        telefono: compra.telefono,
        ip: compra.cliente?.ip || compra.ip,
        userAgent: compra.cliente?.userAgent || compra.userAgent,
        fbp: compra.cliente?.fbp,
        fbc: compra.cliente?.fbc,
        userId: compra.userId,
      }),
      custom_data: {
        currency: 'ARS',
        value: valor,
        content_ids: compra.items.map((item) => item.productId),
        content_type: 'product',
        num_items: compra.items.reduce((acc, item) => acc + item.quantity, 0),
        contents: compra.items.map((item) => ({ id: item.productId, quantity: item.quantity, item_price: Number(item.price) })),
      },
    });
  } catch (err) {
    logger.error(`No se pudo registrar la compra ${compra.orderNumber}: ${err}`);
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

  let notas: { paymentMethod?: string; buyerEmail?: string; buyerPhone?: string; metaCliente?: ClienteMeta } = {};
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
    cliente: notas.metaCliente,
    userId: order.userId,
  });
}
