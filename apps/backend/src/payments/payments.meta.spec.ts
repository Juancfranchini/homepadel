import * as crypto from 'crypto';
import { informarTransferenciaPagadaAMeta } from './payments.meta';

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

function construir(order: Record<string, unknown> | null, meta: Record<string, unknown> = {}) {
  const prisma = {
    order: { findUnique: jest.fn().mockResolvedValue(order) },
    siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '1041282918808105', accessToken: 'token', ...meta } }) },
    marketingEvent: { create: jest.fn().mockResolvedValue({}) },
  };
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as never;
  return prisma;
}

const cuerpo = () => JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

const ORDEN_TRANSFERENCIA = {
  number: 'HP-100',
  channel: 'ONLINE',
  total: 754500,
  notes: JSON.stringify({ paymentMethod: 'transfer', buyerEmail: 'Cliente@Ejemplo.com', buyerPhone: '11 4083-2310' }),
  items: [{ productId: 'prod-1', quantity: 1, price: 750000 }],
};

describe('informarTransferenciaPagadaAMeta', () => {
  it('informa la compra con el total real de la orden, no un valor fijo', async () => {
    await informarTransferenciaPagadaAMeta(construir(ORDEN_TRANSFERENCIA) as never, 'o-1');

    const evento = cuerpo().data[0];
    expect(evento.event_name).toBe('Purchase');
    expect(evento.event_id).toBe('purchase_HP-100');
    expect(evento.custom_data).toMatchObject({ value: 754500, currency: 'ARS', content_ids: ['prod-1'], order_id: 'HP-100' });
  });

  it('manda email y teléfono cifrados, nunca en claro', async () => {
    await informarTransferenciaPagadaAMeta(construir(ORDEN_TRANSFERENCIA) as never, 'o-1');

    const enviado = (global.fetch as jest.Mock).mock.calls[0][1].body as string;
    expect(cuerpo().data[0].user_data.em).toEqual([sha256('cliente@ejemplo.com')]);
    expect(cuerpo().data[0].user_data.ph).toHaveLength(2);
    expect(enviado).not.toContain('Ejemplo');
    expect(enviado).not.toContain('40832310');
  });

  it('no informa las ventas del local ni de redes: no son compras del sitio', async () => {
    await informarTransferenciaPagadaAMeta(construir({ ...ORDEN_TRANSFERENCIA, channel: 'LOCAL' }) as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no informa una compra de prueba', async () => {
    await informarTransferenciaPagadaAMeta(construir({ ...ORDEN_TRANSFERENCIA, isTest: true }) as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no informa una compra hecha con un mail de prueba aunque la orden no esté marcada', async () => {
    const prisma = construir(ORDEN_TRANSFERENCIA);
    prisma.siteSection.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) =>
      where.key === 'cuentas_prueba'
        ? { data: { emails: ['cliente@ejemplo.com'] } }
        : { data: { pixelId: '1041282918808105', accessToken: 'token' } },
    );
    await informarTransferenciaPagadaAMeta(prisma as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no informa las de Mercado Pago: esas ya se informan al acreditarse el pago', async () => {
    const mp = { ...ORDEN_TRANSFERENCIA, notes: JSON.stringify({ paymentMethod: 'mercadopago' }) };
    await informarTransferenciaPagadaAMeta(construir(mp) as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('Purchase: solo producción cuenta de verdad', () => {
  const entorno = process.env;
  afterEach(() => {
    process.env = entorno;
  });

  const conCliente = (cliente: Record<string, unknown>) => ({
    ...ORDEN_TRANSFERENCIA,
    notes: JSON.stringify({ paymentMethod: 'transfer', buyerEmail: 'cliente@ejemplo.com', metaCliente: cliente }),
  });
  const PRODUCCION = {
    origen: 'https://www.homepadel.com.ar',
    ip: '200.1.2.3',
    userAgent: 'Safari',
    fbp: 'fb.1.1700000000000.123456789',
    fbc: 'fb.1.1700000000000.AbCdEf',
  };

  it('desde producción suma al embudo y manda IP, navegador y cookies del Pixel guardados con el pedido', async () => {
    const prisma = construir(conCliente(PRODUCCION));
    await informarTransferenciaPagadaAMeta(prisma as never, 'o-1');

    expect(prisma.marketingEvent.create).toHaveBeenCalledWith({ data: { eventName: 'Purchase', value: 754500 } });
    const evento = cuerpo().data[0];
    expect(evento.user_data).toMatchObject({
      client_ip_address: '200.1.2.3',
      client_user_agent: 'Safari',
      fbp: PRODUCCION.fbp,
      fbc: PRODUCCION.fbc,
    });
    expect(evento.event_source_url).toBe('https://www.homepadel.com.ar/checkout/success?order=HP-100');
  });

  it('en producción ignora el código de prueba: si quedó cargado, las compras reales no se pierden', async () => {
    await informarTransferenciaPagadaAMeta(construir(conCliente(PRODUCCION), { testEventCode: 'TEST1' }) as never, 'o-1');
    expect(cuerpo().test_event_code).toBeUndefined();
  });

  it('desde localhost sin código de prueba no sale a Meta ni suma al embudo', async () => {
    const prisma = construir(conCliente({ origen: 'http://localhost:3000' }));
    await informarTransferenciaPagadaAMeta(prisma as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
  });

  it('desde el dominio viejo con código de prueba va a Eventos de prueba de Meta', async () => {
    process.env = { ...entorno, META_TEST_EVENT_CODE: 'TEST42' };
    const prisma = construir(conCliente({ origen: 'https://www.homepadel.store' }));
    await informarTransferenciaPagadaAMeta(prisma as never, 'o-1');
    expect(cuerpo().test_event_code).toBe('TEST42');
    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
  });

  it('compra hecha probando eventos: va a Probar eventos con valor y moneda, sin sumar, aunque la orden sea de prueba', async () => {
    const prisma = construir({ ...conCliente({ ...PRODUCCION, testEventCode: 'TEST777' }), isTest: true }, { testEventCode: 'TEST777' });
    await informarTransferenciaPagadaAMeta(prisma as never, 'o-1');

    expect(cuerpo().test_event_code).toBe('TEST777');
    expect(cuerpo().data[0].custom_data).toMatchObject({ value: 754500, currency: 'ARS' });
    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
  });

  it('META_EVENTS_ENABLED=false apaga el envío a Meta, pero la venta real sigue sumando al embudo', async () => {
    process.env = { ...entorno, META_EVENTS_ENABLED: 'false' };
    const prisma = construir(conCliente(PRODUCCION));
    await informarTransferenciaPagadaAMeta(prisma as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(prisma.marketingEvent.create).toHaveBeenCalled();
  });
});
