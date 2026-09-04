import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService, ResolvedItem } from '../pricing/pricing.service';
import * as bcrypt from 'bcrypt';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
  ) {}

  /**
   * N3 / N4 — Sin valores por defecto adivinados.
   *
   * Antes, si faltaba la variable de entorno se usaba un dominio inventado:
   * el aviso de pago se enviaba a una dirección inexistente y la venta se
   * perdía en silencio. Ahora falta la variable y el checkout falla de forma
   * visible, sin afectar al resto del sitio.
   */
  private requiredUrl(name: 'FRONTEND_URL' | 'BACKEND_URL'): string {
    const value = process.env[name];
    if (value) return value.replace(/\/+$/, '');

    if (IS_PRODUCTION) {
      this.logger.error(`Falta la variable de entorno ${name}: no se puede cobrar sin ella.`);
      throw new InternalServerErrorException(
        'El medio de pago no está configurado. Avisá a la tienda o probá con otro método.',
      );
    }

    return name === 'FRONTEND_URL' ? 'http://localhost:3000' : 'http://localhost:4000';
  }

  private get FRONTEND_URL(): string {
    return this.requiredUrl('FRONTEND_URL');
  }

  private get BACKEND_URL(): string {
    return this.requiredUrl('BACKEND_URL');
  }

  private async getMPAccessToken(): Promise<string> {
    const config = await this.prisma.siteSection.findUnique({ where: { key: 'payment_methods' } });
    const mp = (config?.data as any)?.mercadopago || {};
    return process.env.MERCADOPAGO_ACCESS_TOKEN || mp.accessToken || '';
  }

  async createPreference(orderNumber: string, items: any[], payer: { name: string; email: string }, externalReference: string) {
    // Se leen las URLs antes de tocar la base: si la configuración falta,
    // conviene fallar acá y no después de haber creado una orden huérfana.
    const frontendUrl = this.FRONTEND_URL;
    const backendUrl = this.BACKEND_URL;
    const accessToken = await this.getMPAccessToken();

    // S3 / F6 — El precio sale de la base y se verifica el stock. Lo que haya
    // mandado el navegador en `price` se descarta por completo.
    const resolvedItems = await this.pricing.resolveItems(
      (items || []).map((item: any) => ({ productId: item.productId, quantity: item.quantity })),
    );

    const subtotal = resolvedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // P3 - Orden pendiente en la tabla de órdenes, no en la de configuración.
    // El stock se descuenta recién cuando el pago se aprueba (ver handleWebhook),
    // para no reservar unidades por carritos que quedan abandonados.
    try {
      await this.prisma.order.create({
        data: {
          number: orderNumber,
          userId: null,
          status: 'PENDING',
          total: subtotal,
          subtotal,
          shipping: 0,
          discount: 0,
          address: 'Pendiente de pago',
          notes: JSON.stringify({ externalReference, pendingPayment: true }),
          items: { create: resolvedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })) },
        },
      });
    } catch (err) {
      this.logger.warn(`No se pudo crear la orden pendiente ${orderNumber}: ${err}`);
    }

    const body = {
      external_reference: externalReference,
      notification_url: backendUrl + '/api/payments/webhook',
      payer: { name: payer.name, email: payer.email },
      items: resolvedItems.map((item) => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'ARS',
      })),
      back_urls: {
        success: frontendUrl + '/checkout/success?order=' + orderNumber,
        failure: frontendUrl + '/checkout/error?order=' + orderNumber,
        pending: frontendUrl + '/checkout/pending?order=' + orderNumber,
      },
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async handleWebhook(body: any, signature: string, xRequestId: string) {
    if (body.type !== 'payment') return { received: true };
    const paymentId = body.data?.id;
    if (!paymentId) return { received: true };

    // N2 - Validación de firma según la especificación de Mercado Pago
    if (!this.isSignatureValid(String(paymentId), signature, xRequestId)) {
      return { received: true, signatureInvalid: true };
    }

    // P2 - Idempotencia: verificar si el pago ya fue procesado
    const existingOrder = await this.prisma.order.findFirst({
      where: { notes: { contains: String(paymentId) } },
    });
    if (existingOrder) {
      this.logger.log(`Pago ya procesado, se ignora: ${paymentId}`);
      return { received: true, alreadyProcessed: true };
    }

    try {
      const accessToken = await this.getMPAccessToken();
      const response = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
      });
      const payment = await response.json();

      if (payment.status !== 'approved') {
        this.logger.log(`Pago ${paymentId} en estado "${payment.status}": no se registra la venta.`);
        return { received: true };
      }

      const ref = payment.external_reference;
      const email = payment.payer?.email || '';
      const name = payment.payer?.first_name || 'Cliente MP';

      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user && email) {
        // P4 - Password con bcrypt
        const randomPassword = 'mp_' + Math.random().toString(36).slice(2) + Date.now();
        const hashed = await bcrypt.hash(randomPassword, 10);
        user = await this.prisma.user.create({
          data: { email, name, password: hashed, role: 'CUSTOMER' },
        });
      }

      // Buscar la orden pendiente creada en createPreference, con sus ítems:
      // hacen falta para descontar el stock ahora que el pago se confirmó.
      const pendingOrder = await this.prisma.order.findFirst({
        where: { notes: { contains: ref } },
        include: { items: { include: { product: { select: { name: true } } } } },
      });

      if (pendingOrder) {
        // F6 - Recién acá se descuenta el stock: la reserva no se hace al abrir
        // el checkout para no retener unidades por carritos abandonados.
        try {
          await this.pricing.decrementStock(
            pendingOrder.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              quantity: item.quantity,
              price: item.price,
            })),
          );
        } catch (stockErr) {
          // El pago ya se cobró: la venta se registra igual y queda el aviso
          // para que la tienda resuelva el faltante con el comprador.
          this.logger.error(
            `Pago ${paymentId} aprobado pero sin stock para la orden ${pendingOrder.number}: ${stockErr}`,
          );
        }

        await this.prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            status: 'PAID',
            userId: user?.id ?? pendingOrder.userId,
            total: payment.transaction_amount || pendingOrder.total,
            notes: JSON.stringify({ paymentId: payment.id, paymentMethod: 'mercadopago', paymentStatus: payment.status, buyerEmail: email, buyerName: name }),
          },
        });

        this.logger.log(`Orden ${pendingOrder.number} marcada como pagada.`);
      } else {
        // Fallback: crear orden si no existe
        const orderNumber = 'HP-' + Date.now();
        const subtotal = payment.transaction_amount || 0;
        await this.prisma.order.create({
          data: {
            number: orderNumber, userId: user?.id || null, status: 'PAID',
            total: subtotal, subtotal, shipping: 0, discount: 0,
            address: 'Compra via Mercado Pago',
            notes: JSON.stringify({ paymentId: payment.id, paymentMethod: 'mercadopago', paymentStatus: payment.status, buyerEmail: email, buyerName: name }),
          },
        });
      }

      await this.sendPurchaseToMeta(
        payment,
        pendingOrder?.number || 'HP-' + Date.now(),
        pendingOrder?.items.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price })) ?? [],
        email,
      );
    } catch (err) {
      this.logger.error(`Error procesando el aviso del pago ${paymentId}: ${err}`);
    }

    return { received: true };
  }

  /**
   * N2 — Verificación de la firma del aviso de pago.
   *
   * Mercado Pago envía la cabecera `x-signature` con esta forma:
   *     ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839
   *
   * y firma esta cadena exacta (el "manifest"), no el cuerpo de la petición:
   *     id:<data.id>;request-id:<x-request-id>;ts:<ts>;
   *
   * El identificador va en minúsculas cuando es alfanumérico, y los tramos cuyo
   * valor no llega se omiten enteros. La implementación anterior firmaba el
   * cuerpo serializado y comparaba contra la cabecera completa, así que ninguna
   * firma legítima podía coincidir.
   */
  private isSignatureValid(paymentId: string, signature: string, xRequestId: string): boolean {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

    if (!secret) {
      // Sin secreto no hay forma de distinguir un aviso real de uno falso.
      // En producción se rechaza: aceptar avisos sin verificar permitiría a
      // cualquiera marcar órdenes como pagadas.
      if (IS_PRODUCTION) {
        this.logger.error(
          'Falta MERCADOPAGO_WEBHOOK_SECRET: se rechazan los avisos de pago hasta configurarlo.',
        );
        return false;
      }
      this.logger.warn('Sin MERCADOPAGO_WEBHOOK_SECRET — validación de firma omitida (solo desarrollo).');
      return true;
    }

    if (!signature) {
      this.logger.error('Aviso de pago sin cabecera x-signature.');
      return false;
    }

    // La cabecera trae pares separados por coma: ts=... , v1=...
    const parts = new Map(
      signature.split(',').map((chunk) => {
        const [name, ...rest] = chunk.split('=');
        return [name.trim(), rest.join('=').trim()] as const;
      }),
    );

    const ts = parts.get('ts');
    const received = parts.get('v1');
    if (!ts || !received) {
      this.logger.error('Cabecera x-signature con formato inesperado.');
      return false;
    }

    const id = /^[a-z0-9]+$/i.test(paymentId) ? paymentId.toLowerCase() : paymentId;
    let manifest = `id:${id};`;
    if (xRequestId) manifest += `request-id:${xRequestId};`;
    manifest += `ts:${ts};`;

    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    // Comparación de tiempo constante: evita filtrar información por la
    // duración de la comparación. timingSafeEqual exige longitudes iguales.
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(received, 'utf8');
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!valid) this.logger.error(`Firma inválida en el aviso del pago ${paymentId}.`);
    return valid;
  }

  private async sendPurchaseToMeta(payment: any, orderNumber: string, items: any[], email: string) {
    try {
      const metaConfig = await this.prisma.siteSection.findUnique({ where: { key: 'meta_pixel' } });
      const config: any = metaConfig?.data || {};
      if (!config.pixelId || !config.accessToken) return;

      const hashEmail = (email: string) => {
        const normalized = email.trim().toLowerCase();
        return crypto.createHash('sha256').update(normalized).digest('hex');
      };

      const apiUrl = 'https://graph.facebook.com/v21.0/' + config.pixelId + '/events';
      const eventId = 'purchase_' + orderNumber;
      const value = payment.transaction_amount || items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);

      const payload = {
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: this.FRONTEND_URL + '/checkout/success?order=' + orderNumber,
          action_source: 'website',
          user_data: {
            em: email ? [hashEmail(email)] : undefined,
            client_ip_address: payment.payer?.ip_address || undefined,
            client_user_agent: payment.payer?.user_agent || undefined,
          },
          custom_data: {
            currency: 'ARS',
            value: value,
            content_ids: items.map((item: any) => item.productId),
            content_type: 'product',
            contents: items.map((item: any) => ({
              id: item.productId,
              quantity: item.quantity,
              item_price: Number(item.price),
            })),
          },
        }],
      };

      const params: any = { access_token: config.accessToken };
      if (config.testEventCode) {
        params.test_event_code = config.testEventCode;
      }

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Error enviando Purchase a Meta:', err);
    }
  }
}