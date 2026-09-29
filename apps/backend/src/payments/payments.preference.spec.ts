/**
 * Preferencia de pago de Mercado Pago.
 *
 * Lo que estas pruebas protegen, y el motivo de cada una:
 *
 *  · `auto_return`. Sin ese campo Mercado Pago no devuelve al comprador: lo
 *    deja en su pantalla con un botón "Volver al sitio" cuyo destino depende
 *    de cómo clasifique el pago en ese momento, y un pago acreditado terminaba
 *    cayendo en /checkout/error.
 *
 *  · El domicilio. El aviso de pago de Mercado Pago no trae dirección ni
 *    teléfono: si no quedan guardados al crear la preferencia, la venta se
 *    registra sin datos a dónde enviarla. Antes se guardaba literalmente
 *    "Pendiente de pago" en el campo de domicilio.
 *
 *  · El número de orden. Lo elegía el navegador, así que se podía repetir el
 *    de una orden existente.
 */

import { InternalServerErrorException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';

const ITEM_RESUELTO = {
  productId: 'prod-1',
  variantId: undefined,
  name: 'Paleta Nox AT10',
  quantity: 1,
  price: 500000,
};

const DTO_BASE: CreatePreferenceDto = {
  items: [{ productId: 'prod-1', quantity: 1 }],
  payer: { name: 'Juan Cruz', email: 'comprador@ejemplo.com' },
  shipping: {
    street: 'Av. Rivadavia 4321',
    city: 'CABA',
    province: 'Buenos Aires',
    postalCode: '1205',
    phone: '1140832310',
  },
};

function construirServicio() {
  const ordenesCreadas: any[] = [];

  const prisma = {
    siteSection: { findUnique: jest.fn().mockResolvedValue({ data: {} }) },
    order: {
      create: jest.fn((args: any) => {
        ordenesCreadas.push(args.data);
        return Promise.resolve(args.data);
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn(({ where }: { where: { number: string } }) => Promise.resolve(ordenesCreadas.find((o) => o.number === where.number) ?? null)),
      update: jest.fn(({ where, data }: { where: { number: string }; data: Record<string, unknown> }) => {
        const orden = ordenesCreadas.find((o) => o.number === where.number);
        Object.assign(orden, data);
        return Promise.resolve(orden);
      }),
    },
  };
  (prisma as any).$transaction = jest.fn((callback: (tx: unknown) => unknown) => callback(prisma));
  const pricing = {
    resolveItems: jest.fn().mockResolvedValue([ITEM_RESUELTO]),
    calculateShipping: jest.fn().mockResolvedValue(12000),
  };
  const coupons = { validate: jest.fn(), calculateDiscount: jest.fn() };

  const service = new PaymentsService(
    prisma as any,
    pricing as any,
    coupons as any,
    { markRecovered: jest.fn() } as any,
  );
  return { service, prisma, pricing, ordenesCreadas };
}

/** Devuelve el cuerpo que se le mandó a la API de Mercado Pago. */
function cuerpoEnviado(): any {
  return JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
}

describe('PaymentsService.createPreference', () => {
  const entornoOriginal = process.env;

  beforeEach(() => {
    process.env = {
      ...entornoOriginal,
      FRONTEND_URL: 'https://www.homepadel.store',
      BACKEND_URL: 'https://api.homepadel.store',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'pref-123', init_point: 'https://mp.com/pagar' }),
    }) as any;
  });

  afterEach(() => {
    process.env = entornoOriginal;
  });

  it('pide a Mercado Pago que devuelva solo al comprador con el pago aprobado', async () => {
    const { service } = construirServicio();
    await service.createPreference(DTO_BASE);

    expect(cuerpoEnviado().auto_return).toBe('approved');
  });

  it('arma las tres URLs de vuelta sobre el dominio configurado', async () => {
    const { service } = construirServicio();
    await service.createPreference(DTO_BASE);

    const { back_urls } = cuerpoEnviado();
    expect(back_urls.success).toContain('https://www.homepadel.store/checkout/success?order=HP-');
    expect(back_urls.failure).toContain('https://www.homepadel.store/checkout/error?order=HP-');
    expect(back_urls.pending).toContain('https://www.homepadel.store/checkout/pending?order=HP-');
  });

  it('guarda el domicilio y el teléfono en la orden pendiente', async () => {
    const { service, ordenesCreadas } = construirServicio();
    await service.createPreference(DTO_BASE);

    const orden = ordenesCreadas[0];
    expect(orden.address).toBe('Av. Rivadavia 4321, CABA, Buenos Aires (1205)');
    expect(JSON.parse(orden.notes)).toMatchObject({
      buyerPhone: '1140832310',
      buyerEmail: 'comprador@ejemplo.com',
      buyerName: 'Juan Cruz',
    });
  });

  it('deja constancia cuando la compra llega sin domicilio, en vez de inventar uno', async () => {
    const { service, ordenesCreadas } = construirServicio();
    await service.createPreference({ ...DTO_BASE, shipping: undefined });

    expect(ordenesCreadas[0].address).toBe('Sin domicilio: pedírselo al comprador');
  });

  it('retiro en el local no requiere domicilio y avisa al servicio de tarifas cuál es el transportista', async () => {
    const { service, pricing, ordenesCreadas } = construirServicio();
    await service.createPreference({
      ...DTO_BASE,
      shipping: { phone: '1140832310', carrier: 'retiro_local' },
    });

    // El monto real de "gratis" lo decide PricingService.calculateShipping
    // (ver pricing.service.spec.ts) — acá solo importa que le llegue el dato
    // correcto para decidirlo.
    expect(pricing.calculateShipping).toHaveBeenCalledWith(expect.any(Number), 'retiro_local', undefined);
    expect(ordenesCreadas[0].address).toBe('Retiro en el local');
    expect(JSON.parse(ordenesCreadas[0].notes)).toMatchObject({ shippingCarrier: 'retiro_local' });
  });

  it('Envío Flex: la localidad llega al cálculo y la dirección dice el servicio y la zona', async () => {
    const { service, pricing, ordenesCreadas } = construirServicio();
    await service.createPreference({
      ...DTO_BASE,
      shipping: { street: 'Av. Presidente Perón 1234', city: 'San Miguel', province: 'Buenos Aires', postalCode: '1663', phone: '1140832310', carrier: 'flex' },
    });

    expect(pricing.calculateShipping).toHaveBeenCalledWith(expect.any(Number), 'flex', 'San Miguel');
    expect(ordenesCreadas[0].address).toBe('Envío Flex (zona 1) — Av. Presidente Perón 1234, San Miguel, Buenos Aires (1663)');
    expect(JSON.parse(ordenesCreadas[0].notes)).toMatchObject({ shippingCarrier: 'flex' });
  });

  it('ignora el número de orden que mande el navegador y genera el suyo', async () => {
    const { service, ordenesCreadas } = construirServicio();
    await service.createPreference({
      ...DTO_BASE,
      orderNumber: 'HP-1',
      externalReference: 'order_1',
    });

    expect(ordenesCreadas[0].number).not.toBe('HP-1');
    expect(JSON.parse(ordenesCreadas[0].notes).externalReference).not.toBe('order_1');
  });

  it('falla de forma visible si Mercado Pago rechaza la preferencia', async () => {
    const { service } = construirServicio();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'invalid_items' }),
    });

    await expect(service.createPreference(DTO_BASE)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('cobra el envío que calcula el servidor, no el que diga el navegador', async () => {
    const { service } = construirServicio();
    await service.createPreference(DTO_BASE);

    expect(cuerpoEnviado().shipments).toEqual({ cost: 12000, mode: 'not_specified' });
  });

  it('reintentar el mismo checkout con el mismo contenido reusa la preferencia, sin pedido nuevo', async () => {
    const { service, prisma, ordenesCreadas } = construirServicio();
    const primera = await service.createPreference({ ...DTO_BASE, checkoutId: 'chk-1' });
    // Lo que devuelve la base al buscar el intento: el pedido recién creado.
    prisma.order.findFirst.mockResolvedValue({ number: primera.orderNumber, status: 'PENDING', notes: ordenesCreadas[0].notes });

    const segunda = await service.createPreference({ ...DTO_BASE, checkoutId: 'chk-1' });
    expect(segunda).toEqual({ id: 'pref-123', init_point: 'https://mp.com/pagar', orderNumber: primera.orderNumber });
    expect(ordenesCreadas).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('si cambió el carrito, el reintento arma un pedido nuevo', async () => {
    const { service, prisma, pricing, ordenesCreadas } = construirServicio();
    const primera = await service.createPreference({ ...DTO_BASE, checkoutId: 'chk-1' });
    prisma.order.findFirst.mockResolvedValue({ number: primera.orderNumber, status: 'PENDING', notes: ordenesCreadas[0].notes });
    pricing.resolveItems.mockResolvedValue([{ ...ITEM_RESUELTO, quantity: 2 }]);

    await service.createPreference({ ...DTO_BASE, checkoutId: 'chk-1' });
    expect(ordenesCreadas).toHaveLength(2);
  });

  it('si ese checkout ya se pagó, no deja pagar otra vez', async () => {
    const { service, prisma } = construirServicio();
    prisma.order.findFirst.mockResolvedValue({ number: 'HP-1', status: 'PAID', notes: '{}' });
    await expect(service.createPreference({ ...DTO_BASE, checkoutId: 'chk-1' })).rejects.toMatchObject({
      response: { yaPagado: true, orderNumber: 'HP-1' },
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('con cuotas por monto activas, le pone el tope a Mercado Pago según los productos', async () => {
    const { service, prisma } = construirServicio();
    prisma.siteSection.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) =>
      where.key === 'cuotas'
        ? { data: { activo: true, tramos: [{ desde: 300000, cuotas: 9 }, { desde: 400000, cuotas: 12 }], cuotasBase: 1 } }
        : { data: {} },
    );
    await service.createPreference(DTO_BASE);
    expect(cuerpoEnviado().payment_methods).toEqual({ installments: 12 });
  });

  it('sin cuotas por monto activas, no cambia lo que ofrece Mercado Pago', async () => {
    const { service } = construirServicio();
    await service.createPreference(DTO_BASE);
    expect(cuerpoEnviado().payment_methods).toBeUndefined();
  });
});
