import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService, ResolvedItem } from '../pricing/pricing.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreatePreferenceDto, ShippingData } from './dto/create-preference.dto';
import { enviarCompraAMeta } from './payments.meta';
import { verificarFirma } from './payments.signature';
import { AbandonedCartsService } from '../abandoned-carts/abandoned-carts.service';
import * as bcrypt from 'bcrypt';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
    private coupons: CouponsService,
    private abandonedCarts: AbandonedCartsService,
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
    // Se leen las URLs antes de tocar la base: si la configuración falta,
    // conviene fallar acá y no después de haber creado una orden huérfana.
    const frontendUrl = this.FRONTEND_URL;
    const backendUrl = this.BACKEND_URL;
    const accessToken = await this.getMPAccessToken();

    // El identificador lo genera el servidor. Antes lo elegía el navegador
    // (`'HP-' + Date.now()`), así que cualquiera podía repetir el número de
    // una orden existente o adivinar el de otra.
    const orderNumber = 'HP-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex');
    const externalReference = 'ref_' + crypto.randomBytes(12).toString('hex');
    const { items, payer, couponCode } = dto;

    // S3 / F6 — El precio sale de la base y se verifica el stock. Lo que haya
    // mandado el navegador en `price` se descarta por completo.
    const resolvedItems = await this.pricing.resolveItems(
      (items || []).map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );

    const subtotal = resolvedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // P1 — mismo cálculo de envío que en el checkout directo (OrdersService):
    // el monto siempre sale de `shipping_rates`, nunca del navegador.
    const shippingCost = await this.pricing.calculateShipping(subtotal);

    // P2 — mismo cupón validado y descontado en el servidor. Si es inválido,
    // la preferencia de pago ni se crea.
    let discount = 0;
    if (couponCode) {
      const coupon = await this.coupons.validate(couponCode, subtotal);
      discount = this.coupons.calculateDiscount(coupon, subtotal);
    }

    // P3 - Orden pendiente en la tabla de órdenes, no en la de configuración.
    // El stock se descuenta recién cuando el pago se aprueba (ver handleWebhook),
    // para no reservar unidades por carritos que quedan abandonados. El
    // cupón, si hay, recién se consume ahí también.
    await this.createPendingOrder(orderNumber, externalReference, resolvedItems, {
      subtotal, shipping: shippingCost, discount, couponCode,
    }, payer, dto.shipping);

    const preferenceItems = this.buildPreferenceItems(resolvedItems, discount, couponCode);

    const body = {
      external_reference: externalReference,
      notification_url: backendUrl + '/api/payments/webhook',
      payer: { name: payer.name, email: payer.email },
      items: preferenceItems,
      // El envío sí tiene campo propio en la API de Mercado Pago.
      shipments: { cost: shippingCost, mode: 'not_specified' },
      back_urls: {
        success: frontendUrl + '/checkout/success?order=' + orderNumber,
        failure: frontendUrl + '/checkout/error?order=' + orderNumber,
        pending: frontendUrl + '/checkout/pending?order=' + orderNumber,
      },
      // Sin `auto_return`, Mercado Pago no devuelve al comprador: lo deja en
      // su propia pantalla con un botón "Volver al sitio" cuyo destino
      // depende de cómo clasifique el pago en ese instante. Con un pago
      // acreditado eso terminaba en /checkout/error. Con auto_return, un pago
      // aprobado vuelve solo y siempre a back_urls.success.
      auto_return: 'approved',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const preference = await response.json();

    if (!response.ok || !preference?.init_point) {
      // El detalle de Mercado Pago queda en el log del servidor, no se le
      // devuelve al navegador: trae datos de la cuenta del vendedor.
      this.logger.error(
        `Mercado Pago rechazó la preferencia de ${orderNumber} (HTTP ${response.status}): ${JSON.stringify(preference)}`,
      );
      throw new InternalServerErrorException(
        'No se pudo iniciar el pago con Mercado Pago. Probá de nuevo o elegí otro método.',
      );
    }

    return { id: preference.id, init_point: preference.init_point, orderNumber };
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
  ) {
    try {
      await this.prisma.order.create({
        data: {
          number: orderNumber,
          userId: null,
          status: 'PENDING',
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
          }),
          items: { create: resolvedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })) },
        },
      });
    } catch (err) {
      this.logger.warn(`No se pudo crear la orden pendiente ${orderNumber}: ${err}`);
    }
  }

  /**
   * El descuento viaja como un ítem más: la API de Preferences de Mercado
   * Pago no tiene un campo de descuento propio, así que se resta como una
   * línea negativa — el patrón habitual para cupones con esta API.
   */
  private buildPreferenceItems(resolvedItems: ResolvedItem[], discount: number, couponCode?: string) {
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

  async handleWebhook(body: any, signature: string, xRequestId: string, query: Record<string, string> = {}) {
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
    const existingOrder = await this.prisma.order.findFirst({
      where: { notes: { contains: String(paymentId) } },
    });
    if (existingOrder) {
      this.logger.log(`Pago ya procesado, se ignora: ${paymentId}`);
      return { received: true, alreadyProcessed: true };
    }

    try {
      const payment = await this.consultarPago(paymentId);

      if (payment?.status !== 'approved') {
        this.logger.log(`Pago ${paymentId} en estado "${payment?.status}": no se registra la venta.`);
        return { received: true };
      }

      await this.liquidarPagoAprobado(payment);
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
   * Registra la venta de un pago que Mercado Pago ya dio por aprobado.
   *
   * Es el mismo trabajo para las dos vías por las que nos podemos enterar de
   * un pago —el aviso de Mercado Pago y la consulta que hacemos nosotros—,
   * así que vive en un solo lugar. Es idempotente: si el pago ya quedó
   * registrado, no vuelve a descontar stock ni a consumir el cupón.
   */
  private async liquidarPagoAprobado(payment: any): Promise<'registrado' | 'ya-estaba'> {
    const paymentId = String(payment.id);

    const yaRegistrado = await this.prisma.order.findFirst({
      where: { notes: { contains: paymentId } },
    });
    if (yaRegistrado) {
      this.logger.log(`Pago ya procesado, se ignora: ${paymentId}`);
      return 'ya-estaba';
    }

    const ref = payment.external_reference;
    const email = payment.payer?.email || '';
    const name = payment.payer?.first_name || 'Cliente MP';

    let user = email ? await this.prisma.user.findUnique({ where: { email } }) : null;
    if (!user && email) {
      // P4 - Password con bcrypt
      const randomPassword = 'mp_' + Math.random().toString(36).slice(2) + Date.now();
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await this.prisma.user.create({ data: { email, name, password: hashed, role: 'CUSTOMER' } });
    }

    // La orden pendiente se creó en createPreference y trae sus ítems: hacen
    // falta para descontar el stock ahora que el pago se confirmó. Si el pago
    // viniera sin referencia, `contains: undefined` haría que Prisma ignore
    // el filtro y devuelva una orden cualquiera: se daría por pagada una
    // ajena. Por eso se exige la referencia.
    const pendingOrder = ref
      ? await this.prisma.order.findFirst({
          where: { notes: { contains: ref } },
          include: { items: { include: { product: { select: { name: true } } } } },
        })
      : null;

    if (pendingOrder) {
      await this.settlePaidOrder(pendingOrder, payment, user, email, name, paymentId);
    } else {
      this.logger.warn(
        `Pago ${paymentId} aprobado sin orden pendiente para la referencia "${ref ?? 'ausente'}": se registra como venta suelta.`,
      );
      await this.createFallbackPaidOrder(payment, user, email, name);
    }

    await enviarCompraAMeta(this.prisma, {
      payment,
      orderNumber: pendingOrder?.number || 'HP-' + Date.now(),
      items: pendingOrder?.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })) ?? [],
      email,
      frontendUrl: this.FRONTEND_URL,
    });

    return 'registrado';
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

    const ref = this.parseNotes(orden.notes).externalReference;
    if (typeof ref !== 'string' || !ref) {
      this.logger.warn(`La orden ${orderNumber} no tiene referencia de pago: no se puede consultar.`);
      return { status: orden.status, confirmada: false };
    }

    try {
      const accessToken = await this.getMPAccessToken();
      const respuesta = await fetch(
        'https://api.mercadopago.com/v1/payments/search?external_reference=' + encodeURIComponent(ref),
        { headers: { Authorization: 'Bearer ' + accessToken }, signal: AbortSignal.timeout(8000) },
      );

      if (!respuesta.ok) {
        this.logger.warn(`Mercado Pago no respondió la búsqueda de ${orderNumber} (HTTP ${respuesta.status}).`);
        return { status: orden.status, confirmada: false };
      }

      const { results } = await respuesta.json();
      const aprobado = (results || []).find((p: any) => p.status === 'approved');
      if (!aprobado) return { status: orden.status, confirmada: false };

      const resultado = await this.liquidarPagoAprobado(aprobado);
      this.logger.log(`Orden ${orderNumber} confirmada por consulta directa (${resultado}).`);
      return { status: 'PAID', confirmada: resultado === 'registrado' };
    } catch (err) {
      this.logger.error(`Error consultando el pago de la orden ${orderNumber}: ${err}`);
      return { status: orden.status, confirmada: false };
    }
  }

  private async settlePaidOrder(
    pendingOrder: {
      id: string; number: string; userId: string | null; couponCode: string | null; total: number; notes: string | null;
      items: { productId: string; variantId: string | null; quantity: number; price: number; product: { name: string } }[];
    },
    payment: any,
    user: { id: string } | null,
    email: string,
    name: string,
    paymentId: string,
  ) {
    // F6 - Recién acá se descuenta el stock: la reserva no se hace al abrir
    // el checkout para no retener unidades por carritos abandonados.
    await this.decrementStockForPaidOrder(pendingOrder, paymentId);

    // P2 — el cupón se consume recién con el pago aprobado, no al abrir la
    // preferencia: mismo criterio que el stock, un checkout abandonado no
    // debe gastar el uso.
    if (pendingOrder.couponCode) {
      this.incrementCouponUsage(pendingOrder.couponCode);
    }

    // Los datos del comprador ya se guardaron al crear la orden pendiente:
    // se conservan en vez de pisarlos, porque el aviso de Mercado Pago no
    // trae el teléfono y antes se perdía al marcar la orden como pagada.
    const datosPrevios = this.parseNotes(pendingOrder.notes);

    await this.prisma.order.update({
      where: { id: pendingOrder.id },
      data: {
        status: 'PAID',
        userId: user?.id ?? pendingOrder.userId,
        total: payment.transaction_amount || pendingOrder.total,
        notes: JSON.stringify({
          ...datosPrevios,
          pendingPayment: false,
          paymentId: payment.id,
          paymentMethod: 'mercadopago',
          paymentStatus: payment.status,
          buyerEmail: datosPrevios.buyerEmail || email,
          buyerName: datosPrevios.buyerName || name,
        }),
      },
    });

    // Si esta persona tenía un carrito abandonado, queda marcado como
    // recuperado: es lo que permite medir cuántos terminan en venta.
    this.abandonedCarts.markRecovered((datosPrevios.buyerEmail as string) || email, pendingOrder.number);

    this.logger.log(`Orden ${pendingOrder.number} marcada como pagada.`);
  }

  /** `notes` guarda un JSON; si viene roto se sigue sin los datos, no se corta la venta. */
  private parseNotes(notes: string | null): Record<string, unknown> {
    if (!notes) return {};
    try {
      const parsed = JSON.parse(notes);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      this.logger.warn('No se pudo leer el JSON de `notes` de una orden.');
      return {};
    }
  }

  /** Cubre el caso raro en que el webhook llega sin una orden PENDING previa. */
  private async createFallbackPaidOrder(payment: any, user: { id: string } | null, email: string, name: string) {
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

  private async decrementStockForPaidOrder(
    pendingOrder: { number: string; items: { productId: string; variantId: string | null; quantity: number; price: number; product: { name: string } }[] },
    paymentId: string,
  ) {
    try {
      await this.pricing.decrementStock(
        pendingOrder.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? undefined,
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
  }

  private incrementCouponUsage(couponCode: string) {
    this.prisma.coupon.updateMany({
      where: { code: { equals: couponCode, mode: 'insensitive' } },
      data: { usedCount: { increment: 1 } },
    }).catch((err) => this.logger.error(`Error incrementando uso de cupón: ${err}`));
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
