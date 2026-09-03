import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private get FRONTEND_URL(): string {
    return process.env.FRONTEND_URL || 'https://www.homepadel.com.ar';
  }

  private get BACKEND_URL(): string {
    return process.env.BACKEND_URL || 'https://api.homepadel.com.ar';
  }

  private async getMPAccessToken(): Promise<string> {
    const config = await this.prisma.siteSection.findUnique({ where: { key: 'payment_methods' } });
    const mp = (config?.data as any)?.mercadopago || {};
    return process.env.MERCADOPAGO_ACCESS_TOKEN || mp.accessToken || '';
  }

  async createPreference(orderNumber: string, items: any[], payer: { name: string; email: string }, externalReference: string) {
    const accessToken = await this.getMPAccessToken();

    // P3 - Crear orden pendiente en la tabla de órdenes, no en SiteSection
    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);

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
          items: { create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
          })) },
        },
      });
    } catch (err) {
      // Si la orden ya existe, continuar
      console.log('Orden pendiente ya existe o error:', err);
    }

    const body = {
      external_reference: externalReference,
      notification_url: this.BACKEND_URL + '/api/payments/webhook',
      payer: { name: payer.name, email: payer.email },
      items: items.map((item) => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unit_price: Number(item.price),
        currency_id: 'ARS',
      })),
      back_urls: {
        success: this.FRONTEND_URL + '/checkout/success?order=' + orderNumber,
        failure: this.FRONTEND_URL + '/checkout/error?order=' + orderNumber,
        pending: this.FRONTEND_URL + '/checkout/pending?order=' + orderNumber,
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

    // P2 - Validar firma del webhook
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(xRequestId + '.' + JSON.stringify(body))
        .digest('hex');
      if (expectedSignature !== signature) {
        console.error('Firma de webhook inválida');
        return { received: true, signatureInvalid: true };
      }
    }

    // P2 - Idempotencia: verificar si el pago ya fue procesado
    const existingOrder = await this.prisma.order.findFirst({
      where: { notes: { contains: paymentId } },
    });
    if (existingOrder) {
      console.log('Pago ya procesado:', paymentId);
      return { received: true, alreadyProcessed: true };
    }

    try {
      const accessToken = await this.getMPAccessToken();
      const response = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
      });
      const payment = await response.json();

      if (payment.status !== 'approved') { console.log('Pago no aprobado:', payment.status); return { received: true }; }

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

      // Buscar la orden pendiente creada en createPreference
      const pendingOrder = await this.prisma.order.findFirst({
        where: { notes: { contains: ref } },
      });

      if (pendingOrder) {
        // Actualizar la orden pendiente a PAID
        await this.prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            status: 'PAID',
            total: payment.transaction_amount || pendingOrder.total,
            notes: JSON.stringify({ paymentId: payment.id, paymentMethod: 'mercadopago', paymentStatus: payment.status, buyerEmail: email, buyerName: name }),
          },
        });

        console.log('Orden actualizada a PAID:', pendingOrder.number);
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

      await this.sendPurchaseToMeta(payment, pendingOrder?.number || 'HP-' + Date.now(), [], email);
    } catch (err) {
      console.error('Error en webhook:', err);
    }

    return { received: true };
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