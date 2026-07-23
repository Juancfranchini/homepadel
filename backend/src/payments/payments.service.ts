import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private FRONTEND_URL = 'http://localhost:3000';
  private BACKEND_URL = 'http://localhost:4000';

  constructor(private prisma: PrismaService) {}

  private async getMPAccessToken(): Promise<string> {
    const config = await this.prisma.siteSection.findUnique({ where: { key: 'payment_methods' } });
    const mp = (config?.data as any)?.mercadopago || {};
    return mp.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  }

  async createPreference(orderNumber: string, items: any[], payer: { name: string; email: string }, externalReference: string) {
    const accessToken = await this.getMPAccessToken();

    await this.prisma.siteSection.upsert({
      where: { key: 'pending_order_' + externalReference },
      update: { data: { orderNumber, items, payer, externalReference } as any, active: true },
      create: { key: 'pending_order_' + externalReference, data: { orderNumber, items, payer, externalReference } as any, active: true },
    });

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

  async handleWebhook(body: any) {
    if (body.type !== 'payment') return;
    const paymentId = body.data?.id;
    if (!paymentId) return;

    try {
      const accessToken = await this.getMPAccessToken();
      const response = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
      });
      const payment = await response.json();

      if (payment.status !== 'approved') { console.log('Pago no aprobado:', payment.status); return; }

      const ref = payment.external_reference;
      const pending = await this.prisma.siteSection.findUnique({ where: { key: 'pending_order_' + ref } });
      const orderData: any = pending?.data || {};
      const email = payment.payer?.email || orderData?.payer?.email || '';
      const name = payment.payer?.first_name || orderData?.payer?.name || 'Cliente MP';

      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user && email) {
        user = await this.prisma.user.create({
          data: { email, name, password: 'mp_' + Math.random().toString(36).slice(2), role: 'CUSTOMER' },
        });
      }

      const orderNumber = orderData?.orderNumber || 'HP-' + Date.now();
      const items = orderData?.items || [];
      const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);

      await this.prisma.order.create({
        data: {
          number: orderNumber, userId: user?.id || null, status: 'PAID',
          total: payment.transaction_amount || subtotal, subtotal, shipping: 0, discount: 0,
          address: 'Compra via Mercado Pago',
          notes: JSON.stringify({ paymentId: payment.id, paymentMethod: 'mercadopago', paymentStatus: payment.status, buyerEmail: email, buyerName: name }),
          items: { create: items.map((item: any) => ({ productId: item.productId, quantity: item.quantity, price: Number(item.price) })) },
        },
      });

      console.log('Orden creada:', orderNumber, 'Usuario:', email);
      await this.prisma.siteSection.delete({ where: { key: 'pending_order_' + ref } }).catch(() => {});
    } catch (err) { console.error('Error en webhook:', err); }
  }
}
