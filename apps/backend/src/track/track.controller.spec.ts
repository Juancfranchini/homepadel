/**
 * Todo evento que pasa por acá (PageView, ViewContent, AddToCart,
 * InitiateCheckout, Contact) nunca llegaba a Meta: leía el token de
 * `process.env.META_ACCESS_TOKEN`, una variable que nunca se configuró en
 * Railway —el backoffice guarda el token en la base, no en el entorno del
 * proceso—. Encima, `SiteSectionsService` intentaba "guardarla" escribiendo
 * un archivo `.env` en el disco, que ni siquiera actualiza `process.env` del
 * proceso que ya está corriendo. El endpoint devolvía `{success:true}` igual,
 * así que nadie se enteraba de que no se mandaba nada.
 *
 * Estas pruebas fijan que la fuente de la configuración es la base de datos
 * (`site_sections` / `meta_pixel`), la misma que ya usa el aviso de compra.
 */

import { TrackController } from './track.controller';
import { TrackEventDto } from './dto/track-event.dto';

function construirRequestFalso() {
  return {
    headers: { cookie: '_fbp=fb.1.111;_fbc=fb.1.222', 'user-agent': 'jest' },
    socket: { remoteAddress: '127.0.0.1' },
  } as any;
}

/** El embudo propio (Marketing) guarda siempre, esté Meta configurado o no. */
function marketingEventFalso() {
  return { create: jest.fn().mockResolvedValue({}) };
}

const EVENTO: TrackEventDto = {
  eventName: 'AddToCart',
  eventId: 'evt-1',
  eventSourceUrl: 'https://homepadel.store/producto/paleta',
  eventData: { content_ids: ['prod-1'] },
};

describe('TrackController', () => {
  const entornoOriginal = process.env;

  beforeEach(() => {
    process.env = { ...entornoOriginal, META_ACCESS_TOKEN: 'esto-ya-no-deberia-usarse' };
  });

  afterEach(() => {
    process.env = entornoOriginal;
  });

  it('no manda nada a Meta si no hay token guardado en site_sections, aunque exista la variable de entorno vieja', async () => {
    const prisma = {
      siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123' } }) },
      marketingEvent: marketingEventFalso(),
    };
    global.fetch = jest.fn() as any;

    const controller = new TrackController(prisma as any);
    const resultado = await controller.track(EVENTO, construirRequestFalso());

    expect(global.fetch).not.toHaveBeenCalled();
    expect(resultado).toEqual({ success: false, message: 'Meta Pixel no configurado' });
  });

  it('guarda el evento para el embudo propio aunque Meta no esté configurado', async () => {
    const prisma = {
      siteSection: { findUnique: jest.fn().mockResolvedValue(null) },
      marketingEvent: marketingEventFalso(),
    };
    global.fetch = jest.fn() as any;

    const controller = new TrackController(prisma as any);
    await controller.track(EVENTO, construirRequestFalso());

    expect(prisma.marketingEvent.create).toHaveBeenCalledWith({
      data: { eventName: 'AddToCart', productId: 'prod-1', productName: undefined, value: undefined },
    });
  });

  it('no deja que un fallo al guardar el evento propio tumbe el aviso a Meta', async () => {
    const prisma = {
      siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123', accessToken: 'token' } }) },
      marketingEvent: { create: jest.fn().mockRejectedValue(new Error('la base no responde')) },
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as any;

    const controller = new TrackController(prisma as any);
    const resultado = await controller.track(EVENTO, construirRequestFalso());

    expect(resultado).toEqual({ success: true });
  });

  it('usa el pixelId y el access token guardados en site_sections, no la variable de entorno', async () => {
    const prisma = {
      siteSection: {
        findUnique: jest.fn().mockResolvedValue({
          data: { pixelId: '1041282918808105', accessToken: 'token-de-la-base', testEventCode: 'TEST123' },
        }),
      },
      marketingEvent: marketingEventFalso(),
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as any;

    const controller = new TrackController(prisma as any);
    const resultado = await controller.track(EVENTO, construirRequestFalso());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v21.0/1041282918808105/events',
      expect.objectContaining({ method: 'POST' }),
    );
    const cuerpo = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(cuerpo.access_token).toBe('token-de-la-base');
    expect(cuerpo.test_event_code).toBe('TEST123');
    expect(cuerpo.data[0]).toMatchObject({
      event_name: 'AddToCart',
      event_id: 'evt-1',
      content_ids: ['prod-1'],
      user_data: expect.objectContaining({ fbp: 'fb.1.111', fbc: 'fb.1.222' }),
    });
    expect(resultado).toEqual({ success: true });
  });

  it('cifra el email y el teléfono del comprador antes de mandarlos a Meta', async () => {
    const prisma = {
      siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123', accessToken: 'token' } }) },
      marketingEvent: marketingEventFalso(),
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as any;

    const controller = new TrackController(prisma as any);
    await controller.track({ ...EVENTO, userData: { email: 'Comprador@Mail.com', phone: '11 4083-2310' } }, construirRequestFalso());

    const enviado = (global.fetch as jest.Mock).mock.calls[0][1].body as string;
    const userData = JSON.parse(enviado).data[0].user_data;
    expect(userData.em).toHaveLength(1);
    expect(userData.ph).toHaveLength(2);
    expect(enviado).not.toContain('Comprador');
    expect(enviado).not.toContain('40832310');
    // El dato personal tampoco queda en el embudo propio.
    expect(JSON.stringify(prisma.marketingEvent.create.mock.calls)).not.toContain('Comprador');
  });

  it('en la compra toma el email y el teléfono de la orden, en el servidor', async () => {
    const prisma = {
      siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123', accessToken: 'token' } }) },
      marketingEvent: marketingEventFalso(),
      order: {
        findUnique: jest.fn().mockResolvedValue({
          notes: JSON.stringify({ buyerEmail: 'Compradora@Mail.com', buyerPhone: '11 4083-2310' }),
          user: null,
        }),
      },
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as any;

    const controller = new TrackController(prisma as any);
    await controller.track({ eventName: 'Purchase', eventId: 'purchase_HP-1', eventData: { value: 750000 } }, construirRequestFalso());

    expect(prisma.order.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { number: 'HP-1' } }));
    const enviado = (global.fetch as jest.Mock).mock.calls[0][1].body as string;
    const userData = JSON.parse(enviado).data[0].user_data;
    expect(userData.em).toHaveLength(1);
    expect(userData.ph).toHaveLength(2);
    expect(enviado).not.toContain('Compradora');
  });

  it('lo que hace una cuenta de prueba no se guarda en el embudo ni llega a Meta', async () => {
    const prisma = {
      siteSection: {
        findUnique: jest.fn(async ({ where }: { where: { key: string } }) =>
          where.key === 'cuentas_prueba'
            ? { data: { emails: ['dueno@homepadel.com.ar'] } }
            : { data: { pixelId: '123', accessToken: 'token' } },
        ),
      },
      marketingEvent: marketingEventFalso(),
    };
    global.fetch = jest.fn() as any;

    const controller = new TrackController(prisma as any);
    await controller.track({ ...EVENTO, eventName: 'InitiateCheckout', userData: { email: 'Dueno@HomePadel.com.ar' } }, construirRequestFalso());

    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('una compra marcada como de prueba no llega a Meta ni al embudo', async () => {
    const prisma = {
      siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123', accessToken: 'token' } }) },
      marketingEvent: marketingEventFalso(),
      order: { findUnique: jest.fn().mockResolvedValue({ notes: null, isTest: true, user: null }) },
    };
    global.fetch = jest.fn() as any;

    const controller = new TrackController(prisma as any);
    await controller.track({ eventName: 'Purchase', eventId: 'purchase_HP-1', eventData: { value: 500 } }, construirRequestFalso());

    expect(prisma.marketingEvent.create).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('usa siempre el pixel configurado, aunque el navegador mande otro', async () => {
    const prisma = {
      siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '1041282918808105', accessToken: 'token' } }) },
      marketingEvent: marketingEventFalso(),
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as any;

    const controller = new TrackController(prisma as any);
    await controller.track({ ...EVENTO, pixelId: '999-otro-dataset' }, construirRequestFalso());

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('https://graph.facebook.com/v21.0/1041282918808105/events');
  });

  it('devuelve success:false y deja registro cuando Meta rechaza el evento, en vez de tragarse el error', async () => {
    const prisma = {
      siteSection: {
        findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123', accessToken: 'token' } }),
      },
      marketingEvent: marketingEventFalso(),
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, text: async () => 'token inválido' }) as any;

    const controller = new TrackController(prisma as any);
    const resultado = await controller.track(EVENTO, construirRequestFalso());

    expect(resultado).toEqual({ success: false });
  });
});
