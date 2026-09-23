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
    order: { create: jest.fn((args: any) => { ordenesCreadas.push(args.data); return Promise.resolve(args.data); }) },
  };
  const pricing = {
    resolveItems: jest.fn().mockResolvedValue([ITEM_RESUELTO]),
    calculateShipping: jest.fn().mockResolvedValue(12000),
  };
  const coupons = { validate: jest.fn(), calculateDiscount: jest.fn() };

  const service = new PaymentsService(prisma as any, pricing as any, coupons as any, { markRecovered: jest.fn() } as any);
  return { service, prisma, pricing, ordenesCreadas };
}

/** Devuelve el cuerpo que se le mandó a la API de Mercado Pago. */
function cuerpoEnviado(): any {
  return JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
}

describe('PaymentsService.createPreference', () => {
  const entornoOriginal = process.env;

  beforeEach(() => {
    process.env = { ...entornoOriginal, FRONTEND_URL: 'https://www.homepadel.store', BACKEND_URL: 'https://api.homepadel.store' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'pref-123', init_point: 'https://mp.com/pagar' }),
    }) as any;
  });

  afterEach(() => { process.env = entornoOriginal; });

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

  it('ignora el número de orden que mande el navegador y genera el suyo', async () => {
    const { service, ordenesCreadas } = construirServicio();
    await service.createPreference({ ...DTO_BASE, orderNumber: 'HP-1', externalReference: 'order_1' });

    expect(ordenesCreadas[0].number).not.toBe('HP-1');
    expect(JSON.parse(ordenesCreadas[0].notes).externalReference).not.toBe('order_1');
  });

  it('falla de forma visible si Mercado Pago rechaza la preferencia', async () => {
    const { service } = construirServicio();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 400, json: async () => ({ message: 'invalid_items' }),
    });

    await expect(service.createPreference(DTO_BASE)).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('cobra el envío que calcula el servidor, no el que diga el navegador', async () => {
    const { service } = construirServicio();
    await service.createPreference(DTO_BASE);

    expect(cuerpoEnviado().shipments).toEqual({ cost: 12000, mode: 'not_specified' });
  });
});
