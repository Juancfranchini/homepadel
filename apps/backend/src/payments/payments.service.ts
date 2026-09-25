import {
  ConflictException,
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService, ResolvedItem } from '../pricing/pricing.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreatePreferenceDto, ShippingData } from './dto/create-preference.dto';
import { verificarFirma } from './payments.signature';
import { AbandonedCartsService } from '../abandoned-carts/abandoned-carts.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentsSettlementService } from './payments-settlement.service';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
    private coupons: CouponsService,
    private abandonedCarts: AbandonedCartsService,
    private settlement: PaymentsSettlementService = new PaymentsSettlementService(
      prisma,
      new InventoryService(prisma),
      abandonedCarts,
    ),
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

  async createPreference(dto: CreatePreferenceDto) {
    const frontendUrl = this.FRONTEND_URL;
    const backendUrl = this.BACKEND_URL;
    const accessToken = await this.getMPAccessToken();
    const orderNumber = 'HP-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex');
    const externalReference = 'ref_' + crypto.randomBytes(12).toString('hex');
    const { payer, couponCode } = dto;
    const { salesLink, resolvedItems, subtotal, shippingCost, discount } =
      await this.prepareCheckout(dto);

    await this.createPendingOrder(
      orderNumber,
      externalReference,
      resolvedItems,
      { subtotal, shipping: shippingCost, discount, couponCode },
      payer,
      dto.shipping,
      salesLink?.id,
    );
    const body = {
      external_reference: externalReference,
      notification_url: backendUrl + '/api/payments/webhook',
      payer: { name: payer.name, email: payer.email },
      items: this.buildPreferenceItems(resolvedItems, discount, couponCode),
      shipments: { cost: shippingCost, mode: 'not_specified' },
      back_urls: {
        success: frontendUrl + '/checkout/success?order=' + orderNumber,
        failure: frontendUrl + '/checkout/error?order=' + orderNumber,
        pending: frontendUrl + '/checkout/pending?order=' + orderNumber,
      },
      auto_return: 'approved',
    };
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const preference = await response.json();
    if (!response.ok || !preference?.init_point) {
      await this.releaseFailedSalesLink(salesLink?.id, orderNumber);
      this.logger.error(
        `Mercado Pago rechazó la preferencia de ${orderNumber} (HTTP ${response.status}): ${JSON.stringify(preference)}`,
      );
      throw new InternalServerErrorException(
        'No se pudo iniciar el pago con Mercado Pago. Probá de nuevo.',
      );
    }
    return { id: preference.id, init_point: preference.init_point, orderNumber };
  }

  private async prepareCheckout(dto: CreatePreferenceDto) {
    const salesLink = dto.salesLinkToken
      ? await this.prisma.salesCheckoutLink.findUnique({ where: { token: dto.salesLinkToken } })
      : null;
    if (dto.salesLinkToken && !salesLink) {
      throw new NotFoundException('El enlace de venta no existe');
    }
    if (
      salesLink &&
      (salesLink.expiresAt < new Date() ||
        !['OPEN', 'CHECKOUT'].includes(salesLink.status) ||
        salesLink.orderId)
    ) {
      throw new ConflictException('Este enlace ya fue usado o venció');
    }
    const requestedItems = salesLink
      ? (salesLink.items as unknown as {
          productId: string;
          variantId?: string;
          quantity: number;
        }[])
      : dto.items;
    const resolvedItems = await this.pricing.resolveItems(
      (requestedItems || []).map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );
    const subtotal = resolvedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = await this.pricing.calculateShipping(subtotal);
    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.coupons.validate(dto.couponCode, subtotal);
      discount = this.coupons.calculateDiscount(coupon, subtotal);
    }
    return { salesLink, resolvedItems, subtotal, shippingCost, discount };
  }

  private async releaseFailedSalesLink(salesLinkId: string | undefined, orderNumber: string) {
    if (!salesLinkId) return;
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { number: orderNumber } });
      await tx.salesCheckoutLink.update({
        where: { id: salesLinkId },
        data: { status: 'OPEN', orderId: null },
      });
      if (!order) return;
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.order.delete({ where: { id: order.id } });
    });
  }

  /**
   * Arma el domicilio con el mismo formato que usa el checkout directo
   * (OrdersService), para que las dos vías se lean igual en el backoffice.
   */
  private formatAddress(shipping?: ShippingData): string {
    if (!shipping) return 'Sin domicilio: pedírselo al comprador';
    return `${shipping.street}, ${shipping.city}, ${shipping.province} (${shipping.postalCode})`;
  }

  private async createPendingOrder(
    orderNumber: string,
    externalReference: string,
    resolvedItems: ResolvedItem[],
    totals: { subtotal: number; shipping: number; discount: number; couponCode?: string },
    payer: { name: string; email: string },
    shipping?: ShippingData,
    salesLinkId?: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          number: orderNumber,
          userId: null,
          status: 'PENDING',
          channel: salesLinkId ? 'SOCIAL' : 'ONLINE',
          total: totals.subtotal + totals.shipping - totals.discount,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          discount: totals.discount,
          couponCode: totals.couponCode || null,
          // El domicilio se guarda al crear la orden: el aviso de pago de
          // Mercado Pago no lo trae, así que si no queda acá la venta se
          // registra sin dirección a la que enviar.
          address: this.formatAddress(shipping),
          notes: JSON.stringify({
            externalReference,
            pendingPayment: true,
            buyerEmail: payer.email,
            buyerName: payer.name,
            buyerPhone: shipping?.phone || null,
            shippingCarrier: shipping?.carrier || 'correo_argentino',
          }),
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
      if (salesLinkId) {
        const link = await tx.salesCheckoutLink.findUniqueOrThrow({ where: { id: salesLinkId } });
        await tx.order.update({
          where: { id: order.id },
          data: {
            channel: link.channel,
            branchId: link.branchId,
            sellerId: link.sellerId,
            createdById: link.sellerId,
          },
        });
        await tx.salesCheckoutLink.update({
          where: { id: salesLinkId },
          data: { status: 'CHECKOUT', orderId: order.id },
        });
      }
    });
  }

  /**
   * El descuento viaja como un ítem más: la API de Preferences de Mercado
   * Pago no tiene un campo de descuento propio, así que se resta como una
   * línea negativa — el patrón habitual para cupones con esta API.
   */
  private buildPreferenceItems(
    resolvedItems: ResolvedItem[],
    discount: number,
    couponCode?: string,
  ) {
    const preferenceItems = resolvedItems.map((item) => ({
      id: item.productId,
      title: item.name + (item.variantId ? ' - variante ' + item.variantId : ''),
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'ARS',
    }));

    if (discount > 0) {
      preferenceItems.push({
        id: 'discount',
        title: 'Descuento (' + couponCode + ')',
        quantity: 1,
        unit_price: -discount,
        currency_id: 'ARS',
      });
    }

    return preferenceItems;
  }

  /**
   * Mercado Pago avisa de dos maneras distintas según cómo esté configurada
   * la integración:
   *
   *   · Webhooks: el detalle va en el cuerpo — {type:'payment', data:{id}}
   *   · IPN: el cuerpo viene vacío y los datos van en la query string,
   *     como ?topic=payment&id=123
   *
   * Solo se entendía la primera. Con la cuenta configurada en IPN el aviso
   * se descartaba en silencio: el pago entraba en Mercado Pago y la orden se
   * quedaba en pendiente para siempre, que es lo que venía pasando.
   */
  private identificarAviso(body: any, query: Record<string, string>) {
    const topic = body?.type || body?.topic || query?.type || query?.topic || null;
    const id = body?.data?.id ?? query?.['data.id'] ?? query?.id ?? null;
    return { topic, paymentId: id ? String(id) : null };
  }

  async handleWebhook(
    body: any,
    signature: string,
    xRequestId: string,
    query: Record<string, string> = {},
  ) {
    const { topic, paymentId } = this.identificarAviso(body, query);

    // Cada salida deja constancia: un aviso descartado sin explicación era
    // indistinguible de uno que nunca llegó.
    if (topic !== 'payment') {
      this.logger.log(`Aviso ignorado: no corresponde a un pago (topic "${topic ?? 'ausente'}").`);
      return { received: true };
    }
    if (!paymentId) {
      this.logger.warn('Aviso de pago sin identificador: no hay qué consultar en Mercado Pago.');
      return { received: true };
    }

    // N2 - Validación de firma según la especificación de Mercado Pago
    if (!this.isSignatureValid(paymentId, signature, xRequestId)) {
      return { received: true, signatureInvalid: true };
    }

    // P2 - Idempotencia: verificar si el pago ya fue procesado
    const [existingPayment, existingOrder] = await Promise.all([
      this.prisma.payment.findUnique({ where: { externalId: String(paymentId) } }),
      this.prisma.order.findFirst({ where: { notes: { contains: String(paymentId) } } }),
    ]);
    if (existingPayment?.status === 'CONFIRMED' || existingOrder) {
      this.logger.log(`Pago ya procesado, se ignora: ${paymentId}`);
      return { received: true, alreadyProcessed: true };
    }

    try {
      const payment = await this.consultarPago(paymentId);

      if (payment?.status !== 'approved') {
        this.logger.log(
          `Pago ${paymentId} en estado "${payment?.status}": no se registra la venta.`,
        );
        return { received: true };
      }

      await this.settlement.settle(payment, this.FRONTEND_URL);
    } catch (err) {
      this.logger.error(`Error procesando el aviso del pago ${paymentId}: ${err}`);
    }

    return { received: true };
  }

  /** Consulta un pago puntual en Mercado Pago. */
  private async consultarPago(paymentId: string): Promise<any> {
    const accessToken = await this.getMPAccessToken();
    const respuesta = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
      headers: { Authorization: 'Bearer ' + accessToken },
    });
    return respuesta.json();
  }

  /**
   * Confirma una orden preguntándole a Mercado Pago, sin esperar su aviso.
   *
   * El aviso (webhook) es un solo canal de entrega y puede fallar —de hecho
   * viene fallando: la firma no valida y las órdenes quedan en PENDING para
   * siempre, con el stock sin descontar y el cupón sin consumir—. Acá el
   * servidor consulta la API de Mercado Pago por la referencia de la orden y
   * la registra si encuentra un pago aprobado.
   *
   * El navegador solo manda un número de orden: no puede afirmar que algo se
   * pagó. Quién decide es Mercado Pago, con el token del vendedor. Conocer un
   * número de orden ajeno no sirve para darla por pagada — solo dispara la
   * misma consulta que haríamos igual.
   */
  async confirmarOrden(orderNumber: string): Promise<{ status: string; confirmada: boolean }> {
    const orden = await this.prisma.order.findUnique({ where: { number: orderNumber } });
    if (!orden) throw new NotFoundException('No encontramos esa orden.');
    if (orden.status !== 'PENDING') return { status: orden.status, confirmada: false };

    const ref = this.settlement.parseNotes(orden.notes).externalReference;
    if (typeof ref !== 'string' || !ref) {
      this.logger.warn(
        `La orden ${orderNumber} no tiene referencia de pago: no se puede consultar.`,
      );
      return { status: orden.status, confirmada: false };
    }

    try {
      const accessToken = await this.getMPAccessToken();
      const respuesta = await fetch(
        'https://api.mercadopago.com/v1/payments/search?external_reference=' +
          encodeURIComponent(ref),
        { headers: { Authorization: 'Bearer ' + accessToken }, signal: AbortSignal.timeout(8000) },
      );

      if (!respuesta.ok) {
        this.logger.warn(
          `Mercado Pago no respondió la búsqueda de ${orderNumber} (HTTP ${respuesta.status}).`,
        );
        return { status: orden.status, confirmada: false };
      }

      const { results } = await respuesta.json();
      const aprobado = (results || []).find((p: any) => p.status === 'approved');
      if (!aprobado) return { status: orden.status, confirmada: false };

      const resultado = await this.settlement.settle(aprobado, this.FRONTEND_URL);
      this.logger.log(`Orden ${orderNumber} confirmada por consulta directa (${resultado}).`);
      return { status: 'PAID', confirmada: resultado === 'registrado' };
    } catch (err) {
      this.logger.error(`Error consultando el pago de la orden ${orderNumber}: ${err}`);
      return { status: orden.status, confirmada: false };
    }
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
      this.logger.warn(
        'Sin MERCADOPAGO_WEBHOOK_SECRET — validación de firma omitida (solo desarrollo).',
      );
      return true;
    }

    const resultado = verificarFirma(paymentId, signature, xRequestId, secret);

    if (resultado.motivo === 'sin-firma') {
      this.logger.error('Aviso de pago sin cabecera x-signature.');
    } else if (resultado.motivo === 'formato-inesperado') {
      this.logger.error('Cabecera x-signature con formato inesperado.');
    } else if (!resultado.valida) {
      // El detalle importa: sin él, "firma inválida" no distingue un secreto
      // equivocado de un manifiesto mal armado. No se registra el secreto,
      // solo su longitud, que alcanza para detectar un pegado incompleto.
      this.logger.error(
        `Firma inválida en el aviso del pago ${paymentId}. ` +
          `Manifiestos probados: ${resultado.manifiestosProbados.map((m) => `"${m}"`).join(' | ')}. ` +
          `Longitud del secreto configurado: ${secret.length}.`,
      );
    }

    return resultado.valida;
  }
}
