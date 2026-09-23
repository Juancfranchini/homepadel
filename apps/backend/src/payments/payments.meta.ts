import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const logger = new Logger('MetaPurchase');

interface ItemComprado {
  productId: string;
  quantity: number;
  price: number;
}

interface Params {
  payment: any;
  orderNumber: string;
  items: ItemComprado[];
  email: string;
  frontendUrl: string;
}

/** Meta exige el email hasheado; nunca se manda en claro. */
function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

/**
 * Informa la compra a la API de Conversiones de Meta.
 *
 * Vive fuera de PaymentsService porque no es parte del cobro: si esto falla,
 * la venta ya está hecha y registrada. Por eso no propaga el error, solo lo
 * deja en el log.
 *
 * El `access_token` se armaba en un objeto que después no se usaba en ningún
 * lado, así que la llamada salía sin credencial y Meta la rechazaba sin que
 * nadie se enterara: el error se tragaba entero en el catch.
 */
export async function enviarCompraAMeta(prisma: PrismaService, { payment, orderNumber, items, email, frontendUrl }: Params): Promise<void> {
  try {
    const seccion = await prisma.siteSection.findUnique({ where: { key: 'meta_pixel' } });
    const config: any = seccion?.data || {};
    if (!config.pixelId || !config.accessToken) return;

    const valor = payment.transaction_amount
      || items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    const payload: Record<string, unknown> = {
      access_token: config.accessToken,
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: 'purchase_' + orderNumber,
        event_source_url: frontendUrl + '/checkout/success?order=' + orderNumber,
        action_source: 'website',
        user_data: {
          em: email ? [hashEmail(email)] : undefined,
          client_ip_address: payment.payer?.ip_address || undefined,
          client_user_agent: payment.payer?.user_agent || undefined,
        },
        custom_data: {
          currency: 'ARS',
          value: valor,
          content_ids: items.map((item) => item.productId),
          content_type: 'product',
          contents: items.map((item) => ({
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
      logger.warn(`Meta rechazó el evento Purchase de ${orderNumber} (HTTP ${respuesta.status}): ${await respuesta.text()}`);
    }
  } catch (err) {
    logger.error(`No se pudo informar la compra ${orderNumber} a Meta: ${err}`);
  }
}
