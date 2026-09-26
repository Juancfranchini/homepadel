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
    const prisma = { siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123' } }) } };
    global.fetch = jest.fn() as any;

    const controller = new TrackController(prisma as any);
    const resultado = await controller.track(EVENTO, construirRequestFalso());

    expect(global.fetch).not.toHaveBeenCalled();
    expect(resultado).toEqual({ success: false, message: 'Meta Pixel no configurado' });
  });

  it('usa el pixelId y el access token guardados en site_sections, no la variable de entorno', async () => {
    const prisma = {
      siteSection: {
        findUnique: jest.fn().mockResolvedValue({
          data: { pixelId: '1041282918808105', accessToken: 'token-de-la-base', testEventCode: 'TEST123' },
        }),
      },
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

  it('devuelve success:false y deja registro cuando Meta rechaza el evento, en vez de tragarse el error', async () => {
    const prisma = {
      siteSection: {
        findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '123', accessToken: 'token' } }),
      },
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, text: async () => 'token inválido' }) as any;

    const controller = new TrackController(prisma as any);
    const resultado = await controller.track(EVENTO, construirRequestFalso());

    expect(resultado).toEqual({ success: false });
  });
});
