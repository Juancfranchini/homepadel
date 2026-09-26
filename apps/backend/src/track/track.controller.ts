import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';

interface MetaPixelConfig {
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
}

function getCookie(cookies: string, name: string): string | null {
  const match = cookies.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
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
  @Post()
  async track(@Body() body: TrackEventDto, @Req() req: Request) {
    const seccion = await this.prisma.siteSection.findUnique({ where: { key: 'meta_pixel' } });
    const config = (seccion?.data as MetaPixelConfig) || {};
    const pixelId = body.pixelId || config.pixelId;

    if (!pixelId || !config.accessToken) return { success: false, message: 'Meta Pixel no configurado' };

    const cookies = req.headers.cookie || '';
    const fbp = getCookie(cookies, '_fbp');
    const fbc = getCookie(cookies, '_fbc');
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
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
          client_ip_address: clientIp || undefined,
          client_user_agent: clientUserAgent || undefined,
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
