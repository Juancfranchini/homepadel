import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { userDataParaMeta } from '../common/meta/meta-user-data';
import { clienteDesdeRequest } from '../common/meta/meta-cliente';
import { destinoMeta, enviarEventoAMeta, esCodigoDePruebaValido, esOrigenDeProduccion, leerConfigMeta } from '../common/meta/meta-destino';
import { esCuentaDePrueba } from '../common/test-accounts';

/** Qué pasó con el evento. `pixel`: si el navegador tiene que mandarlo también por el Pixel (mismo event_id). */
export interface ResultadoTrack {
  registrado: boolean;
  pixel: boolean;
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
   * Un evento del navegador: se cuenta en el embudo del backoffice y se
   * manda a la API de Conversiones de Meta, con las mismas reglas para los
   * dos, así los números se pueden comparar.
   *
   * - Cuentas de prueba (el mail de la sesión o el del checkout): no se
   *   registra ni sale a Meta.
   * - Fuera de producción (localhost, previews, dominios viejos): no suma
   *   en el backoffice y a Meta va solo como evento de prueba, si hay código
   *   (ver meta-destino.ts).
   *
   * El navegador manda el evento por el Pixel solo si esto responde
   * `pixel: true`: así el Pixel y el servidor informan exactamente lo mismo.
   * El token vive en la base (`site_sections` / `meta_pixel`), no en el entorno.
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async track(@Body() body: TrackEventDto, @Req() req: Request, @CurrentUser() usuario?: { id: string }): Promise<ResultadoTrack> {
    const cuenta = usuario
      ? await this.prisma.user.findUnique({ where: { id: usuario.id }, select: { id: true, email: true, phone: true } })
      : null;
    const emails = [body.userData?.email, cuenta?.email];
    const config = await leerConfigMeta(this.prisma);
    const cliente = clienteDesdeRequest(req, body);
    // Probando eventos de Meta (?meta_test= con el código del backoffice): va
    // a "Probar eventos" aunque sea una cuenta de prueba, y no cuenta en ningún lado.
    const probando = esCodigoDePruebaValido(config, cliente.testEventCode);
    if (!probando && (await esCuentaDePrueba(this.prisma, emails))) return { registrado: false, pixel: false };

    const produccion = !probando && esOrigenDeProduccion(cliente.origen);

    if (produccion) {
      const { productId, productName, value } = extraerDatosDeMarketing(body.eventData);
      await this.prisma.marketingEvent
        .create({ data: { eventName: body.eventName, productId, productName, value } })
        .catch((err) => this.logger.warn(`No se pudo guardar el evento ${body.eventName} para el embudo propio: ${err}`));
    }

    const destino = destinoMeta(config, produccion, probando);
    if (!destino) return { registrado: produccion, pixel: false };

    // Valor, productos y moneda van dentro de custom_data: antes iban sueltos
    // en el evento y Meta los ignoraba.
    const customData = { ...(body.eventData || {}), ...(body.customData || {}) };
    // Sin esperar la respuesta de Meta: el navegador no tiene por qué demorarse.
    void enviarEventoAMeta(destino, {
      event_name: body.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.eventId,
      event_source_url: body.eventSourceUrl,
      action_source: 'website',
      user_data: userDataParaMeta({
        emails,
        telefono: body.userData?.phone || cuenta?.phone,
        ip: cliente.ip,
        userAgent: cliente.userAgent,
        fbp: cliente.fbp,
        fbc: cliente.fbc,
        userId: cuenta?.id,
      }),
      ...(Object.keys(customData).length > 0 ? { custom_data: customData } : {}),
    });
    return { registrado: produccion, pixel: produccion };
  }
}
