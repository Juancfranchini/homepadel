import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { userDataParaMeta } from '../common/meta-user-data';

interface MetaPixelConfig {
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
}

function getCookie(cookies: string, name: string): string | null {
  const match = cookies.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Lo mínimo para el embudo propio: qué producto (si hay) y qué valor tenía el evento. */
function extraerDatosDeMarketing(eventData?: Record<string, unknown>) {
  const contentIds = eventData?.content_ids;
  const productId = Array.isArray(contentIds) && typeof contentIds[0] === 'string' ? contentIds[0] : undefined;
  const productName = typeof eventData?.content_name === 'string' ? eventData.content_name : undefined;
  const value = typeof eventData?.value === 'number' ? eventData.value : undefined;
  return { productId, productName, value };
}

@ApiTags('Track')
@Controller('track')
export class TrackController {
  private readonly logger = new Logger(TrackController.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Reenvía el evento a la API de Conversiones de Meta.
   *
   * El access token vivía en `process.env.META_ACCESS_TOKEN`, una variable
   * que nunca existió en Railway: el backoffice guarda el token en la base
   * (`site_sections` / `meta_pixel`), no en el entorno del proceso. Encima,
   * `SiteSectionsService.saveMetaPixelEnv` intentaba escribir un archivo
   * `.env` en el disco del servidor al guardar la configuración —algo que ni
   * siquiera actualiza `process.env` del proceso que ya está corriendo, y que
   * en Railway se pierde en el próximo deploy—. Resultado: cada evento que
   * pasaba por acá (PageView, ViewContent, AddToCart, InitiateCheckout,
   * Contact) nunca llegaba a Meta por este camino, sin ningún error visible
   * -devolvía {success:true} igual-, porque sin credencial la llamada ni se
   * hacía. Ahora lee la misma configuración que ya usa el aviso de compra
   * (`PaymentsService` / `enviarCompraAMeta`), que sí funcionaba.
   */
  /**
   * Email y teléfono para Meta. En la compra salen de la orden, leídos acá
   * en el servidor: así no tienen que pasar por el navegador ni exponerse en
   * la consulta pública del pedido. En el resto de los eventos, los que
   * mande el navegador (los de la cuenta, si hay sesión).
   */
  private async datosDelComprador(body: TrackEventDto): Promise<{ emails: (string | undefined)[]; telefono?: string }> {
    if (body.eventName === 'Purchase' && body.eventId.startsWith('purchase_')) {
      const orden = await this.prisma.order.findUnique({
        where: { number: body.eventId.slice('purchase_'.length) },
        select: { notes: true, user: { select: { email: true } } },
      });
      let notas: { buyerEmail?: string; buyerPhone?: string } = {};
      try {
        notas = orden?.notes ? JSON.parse(orden.notes) : {};
      } catch {
        notas = {};
      }
      return { emails: [notas.buyerEmail, orden?.user?.email], telefono: notas.buyerPhone };
    }
    return { emails: [body.userData?.email], telefono: body.userData?.phone };
  }

  @Post()
  async track(@Body() body: TrackEventDto, @Req() req: Request) {
    // El embudo propio del backoffice (Marketing) no depende de que Meta esté
    // configurado: se guarda siempre, aunque falte el Pixel o el token.
    const { productId, productName, value } = extraerDatosDeMarketing(body.eventData);
    await this.prisma.marketingEvent
      .create({ data: { eventName: body.eventName, productId, productName, value } })
      .catch((err) => this.logger.warn(`No se pudo guardar el evento ${body.eventName} para el embudo propio: ${err}`));

    const seccion = await this.prisma.siteSection.findUnique({ where: { key: 'meta_pixel' } });
    const config = (seccion?.data as MetaPixelConfig) || {};
    // Siempre el pixel configurado: aceptar el que manda el navegador dejaba
    // usar nuestro token para mandar eventos a otro dataset.
    const pixelId = config.pixelId;

    if (!pixelId || !config.accessToken) return { success: false, message: 'Meta Pixel no configurado' };

    const cookies = req.headers.cookie || '';
    const fbp = getCookie(cookies, '_fbp');
    const fbc = getCookie(cookies, '_fbc');
    // Detrás de proxies llega como lista ("cliente, proxy"): Meta espera una sola IP, la del cliente.
    const clientIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
    const clientUserAgent = req.headers['user-agent'] || '';

    const payload: Record<string, unknown> = {
      access_token: config.accessToken,
      data: [{
        event_name: body.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.eventId,
        event_source_url: body.eventSourceUrl,
        action_source: 'website',
        user_data: {
          fbp: fbp || undefined,
          fbc: fbc || undefined,
          ...userDataParaMeta({ ...(await this.datosDelComprador(body)), ip: clientIp, userAgent: clientUserAgent }),
        },
        ...(body.eventData || {}),
        ...(body.customData ? { custom_data: body.customData } : {}),
      }],
    };

    if (config.testEventCode) payload.test_event_code = config.testEventCode;

    try {
      const respuesta = await fetch('https://graph.facebook.com/v21.0/' + pixelId + '/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!respuesta.ok) {
        this.logger.warn(`Meta rechazó el evento ${body.eventName} (HTTP ${respuesta.status}): ${await respuesta.text()}`);
        return { success: false };
      }
      return { success: true };
    } catch (err) {
      this.logger.error(`No se pudo mandar el evento ${body.eventName} a Meta: ${err}`);
      return { success: false };
    }
  }
}
