/**
 * Reglas de /track: el embudo del backoffice y Meta reciben exactamente los
 * mismos eventos, y solo los de la tienda de producción cuentan de verdad.
 * El token de Meta sale de la base (`site_sections` / `meta_pixel`), nunca
 * del entorno: la variable vieja META_ACCESS_TOKEN nunca existió en Railway.
 */

import * as crypto from 'crypto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TrackController } from './track.controller';
import { TrackEventDto } from './dto/track-event.dto';

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const PRODUCCION = 'https://www.homepadel.com.ar';

function request(origin = PRODUCCION) {
  return {
    headers: { origin, 'user-agent': 'jest', 'x-forwarded-for': '200.1.2.3, 10.0.0.1' },
    socket: { remoteAddress: '127.0.0.1' },
  } as never;
}

function construir(meta: Record<string, unknown> | null = { pixelId: '1041282918808105', accessToken: 'token' }, pruebas: string[] = []) {
  const prisma = {
    siteSection: {
      findUnique: jest.fn(async ({ where }: { where: { key: string } }) =>
        where.key === 'cuentas_prueba' ? { data: { emails: pruebas } } : meta ? { data: meta } : null,
      ),
    },
    marketingEvent: { create: jest.fn().mockResolvedValue({}) },
    user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', email: 'Cuenta@Ejemplo.com', phone: '1140832310' }) },
  };
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as never;
  return { prisma, controller: new TrackController(prisma as never) };
}

const EVENTO: TrackEventDto = {
  eventName: 'AddToCart',
  eventId: 'evt-1',
  eventSourceUrl: PRODUCCION + '/producto/paleta',
  eventData: { content_ids: ['prod-1'], value: 1000, currency: 'ARS' },
  fbp: 'fb.1.1700000000000.123456789',
  fbc: 'fb.1.1700000000000.AbCdEf',
};

/** El envío a Meta no se espera (no demora al navegador): se deja correr antes de mirar. */
const esperarEnvio = () => new Promise((resolve) => setImmediate(resolve));
const cuerpo = () => JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

describe('TrackController', () => {
  const entorno = process.env;
  beforeEach(() => {
    process.env = { ...entorno, META_ACCESS_TOKEN: 'esto-no-se-usa' };
  });
  afterEach(() => {
    process.env = entorno;
  });

  it('desde producción suma al embudo, sale a Meta y le dice al navegador que mande el Pixel', async () => {
    const { prisma, controller } = construir();
    const resultado = await controller.track(EVENTO, request());
    await esperarEnvio();

    expect(resultado).toEqual({ registrado: true, pixel: true });
    expect(prisma.marketingEvent.create).toHaveBeenCalledWith({
      data: { eventName: 'AddToCart', productId: 'prod-1', productName: undefined, value: 1000 },
    });
    const evento = cuerpo().data[0];
    expect(evento).toMatchObject({ event_name: 'AddToCart', event_id: 'evt-1', action_source: 'website' });
    expect(cuerpo().test_event_code).toBeUndefined();
  });

  it('valor, productos y moneda van en custom_data, no sueltos en el evento', async () => {
    const { controller } = construir();
    await controller.track(EVENTO, request());
    await esperarEnvio();

    const evento = cuerpo().data[0];
    expect(evento.custom_data).toEqual({ content_ids: ['prod-1'], value: 1000, currency: 'ARS' });
    expect(evento.value).toBeUndefined();
  });

  it('manda IP, navegador y las cookies del Pixel que lee el navegador', async () => {
    const { controller } = construir();
    await controller.track(EVENTO, request());
    await esperarEnvio();

    expect(cuerpo().data[0].user_data).toMatchObject({
      client_ip_address: '200.1.2.3',
      client_user_agent: 'jest',
      fbp: EVENTO.fbp,
      fbc: EVENTO.fbc,
    });
  });

  it('con sesión agrega email, teléfono e id de la cuenta, cifrados', async () => {
    const { controller } = construir();
    await controller.track(EVENTO, request(), { id: 'user-1' });
    await esperarEnvio();

    const enviado = (global.fetch as jest.Mock).mock.calls[0][1].body as string;
    const userData = cuerpo().data[0].user_data;
    expect(userData.em).toEqual([sha256('cuenta@ejemplo.com')]);
    expect(userData.ph).toHaveLength(2);
    expect(userData.external_id).toEqual([sha256('user-1')]);
    expect(enviado).not.toContain('Ejemplo');
    expect(enviado).not.toContain('40832310');
  });

  it('desde localhost no suma al embudo ni sale a Meta si no hay código de prueba', async () => {
    const { prisma, controller } = construir();
    const resultado = await controller.track(EVENTO, request('http://localhost:3000'));
    await esperarEnvio();

    expect(resultado).toEqual({ registrado: false, pixel: false });
    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fuera de producción, con código de prueba, va a Eventos de prueba y el navegador no manda el Pixel', async () => {
    const { prisma, controller } = construir({ pixelId: '1041282918808105', accessToken: 'token', testEventCode: 'TEST123' });
    const resultado = await controller.track(EVENTO, request('https://homepadel.store'));
    await esperarEnvio();

    expect(resultado).toEqual({ registrado: false, pixel: false });
    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
    expect(cuerpo().test_event_code).toBe('TEST123');
  });

  it('en producción ignora el código de prueba del backoffice: si no, los eventos reales no cuentan', async () => {
    const { controller } = construir({ pixelId: '1041282918808105', accessToken: 'token', testEventCode: 'TEST123' });
    await controller.track(EVENTO, request());
    await esperarEnvio();
    expect(cuerpo().test_event_code).toBeUndefined();
  });

  it('META_EVENTS_ENABLED=false corta Meta y el Pixel, pero el embudo sigue contando', async () => {
    process.env = { ...entorno, META_EVENTS_ENABLED: 'false' };
    const { prisma, controller } = construir();
    const resultado = await controller.track(EVENTO, request());
    await esperarEnvio();

    expect(resultado).toEqual({ registrado: true, pixel: false });
    expect(prisma.marketingEvent.create).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sin token guardado no sale a Meta (aunque exista la variable de entorno vieja), pero cuenta en el embudo', async () => {
    const { prisma, controller } = construir({ pixelId: '123' });
    const resultado = await controller.track(EVENTO, request());
    await esperarEnvio();

    expect(resultado).toEqual({ registrado: true, pixel: false });
    expect(prisma.marketingEvent.create).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('lo que hace una cuenta de prueba no cuenta en ningún lado, ni por el Pixel', async () => {
    const { prisma, controller } = construir(undefined, ['cuenta@ejemplo.com']);
    const resultado = await controller.track(EVENTO, request(), { id: 'user-1' });
    await esperarEnvio();

    expect(resultado).toEqual({ registrado: false, pixel: false });
    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('usa siempre el pixel configurado, aunque el navegador mande otro', async () => {
    const { controller } = construir();
    await controller.track({ ...EVENTO, pixelId: '999' }, request());
    await esperarEnvio();
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/1041282918808105/events');
  });

  it('si falla guardar el evento propio, igual sale a Meta', async () => {
    const { prisma, controller } = construir();
    prisma.marketingEvent.create.mockRejectedValue(new Error('base caída'));
    await controller.track(EVENTO, request());
    await esperarEnvio();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('el navegador no puede mandar un Purchase: la compra la informa solo el servidor', async () => {
    const errores = await validate(plainToInstance(TrackEventDto, { ...EVENTO, eventName: 'Purchase' }));
    expect(errores.map((e) => e.property)).toContain('eventName');
  });

  it('rechaza cookies del Pixel con otro formato', async () => {
    const errores = await validate(plainToInstance(TrackEventDto, { ...EVENTO, fbp: '<script>' }));
    expect(errores.map((e) => e.property)).toContain('fbp');
  });
});
