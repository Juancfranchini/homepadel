import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * A dónde va un evento de Meta según desde qué sitio se generó.
 *
 * Solo la tienda de producción manda eventos reales. Antes llegaban también
 * los de localhost y los del dominio viejo (homepadel.store), y ensuciaban el
 * dataset con el que Meta optimiza los anuncios. Fuera de producción:
 *  - con un código de prueba (`META_TEST_EVENT_CODE` o el del backoffice),
 *    el evento va a "Eventos de prueba" de Meta y no cuenta;
 *  - sin código, no sale.
 * En producción el código de prueba se ignora: si quedaba cargado en el
 * backoffice, todos los eventos reales terminaban en "Eventos de prueba".
 *
 * `META_EVENTS_ENABLED=false` apaga todo envío a Meta (por ejemplo en un
 * backend local que usa una copia de la base con el token de producción).
 */

/** Dominios de la tienda de producción. Se pueden cambiar con `META_PRODUCTION_HOSTS` (separados por coma). */
const HOSTS_PRODUCCION_POR_DEFECTO = 'www.homepadel.com.ar';

export function hostsDeProduccion(): string[] {
  return (process.env.META_PRODUCTION_HOSTS || HOSTS_PRODUCCION_POR_DEFECTO)
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

/** True si la dirección (origen o URL completa) es de la tienda de producción, por https. */
export function esOrigenDeProduccion(direccion?: string | null): boolean {
  if (!direccion) return false;
  try {
    const url = new URL(direccion);
    return url.protocol === 'https:' && hostsDeProduccion().includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export interface ConfigMeta {
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
}

export interface DestinoMeta {
  pixelId: string;
  accessToken: string;
  /** Solo fuera de producción. */
  testEventCode?: string;
}

export async function leerConfigMeta(prisma: Pick<PrismaService, 'siteSection'>): Promise<ConfigMeta> {
  const seccion = await prisma.siteSection.findUnique({ where: { key: 'meta_pixel' } });
  return (seccion?.data as ConfigMeta) || {};
}

function codigoDePruebaConfigurado(config: ConfigMeta): string | undefined {
  return (process.env.META_TEST_EVENT_CODE || config.testEventCode || '').trim() || undefined;
}

/**
 * Probar eventos en la tienda real: quien entra con `?meta_test=CODIGO` manda
 * sus eventos y su compra a "Probar eventos" de Meta, y su pedido queda como
 * prueba. Solo vale el código cargado en el backoffice (o `META_TEST_EVENT_CODE`):
 * un código cualquiera no cambia nada.
 */
export function esCodigoDePruebaValido(config: ConfigMeta, codigo?: string | null): boolean {
  const configurado = codigoDePruebaConfigurado(config);
  return !!codigo && !!configurado && codigo.trim() === configurado;
}

/** True si el pedido se hizo probando eventos de Meta con el código válido. */
export async function esPedidoDePruebaDeMeta(
  prisma: Pick<PrismaService, 'siteSection'>,
  cliente?: { testEventCode?: string } | null,
): Promise<boolean> {
  if (!cliente?.testEventCode) return false;
  return esCodigoDePruebaValido(await leerConfigMeta(prisma), cliente.testEventCode);
}

/**
 * Null si el evento no tiene que salir hacia Meta. `probando`: el evento viene
 * con el código de prueba válido, así que va a "Probar eventos" aunque sea de
 * la tienda real.
 */
export function destinoMeta(config: ConfigMeta, produccion: boolean, probando = false): DestinoMeta | null {
  if (process.env.META_EVENTS_ENABLED === 'false') return null;
  if (!config.pixelId || !config.accessToken) return null;
  const base = { pixelId: config.pixelId, accessToken: config.accessToken };
  if (produccion && !probando) return base;
  const testEventCode = codigoDePruebaConfigurado(config);
  return testEventCode ? { ...base, testEventCode } : null;
}

const logger = new Logger('MetaConversiones');

/** Manda un evento a la API de Conversiones. No lanza: devuelve si Meta lo aceptó y deja el motivo en el log. */
export async function enviarEventoAMeta(destino: DestinoMeta, evento: Record<string, unknown>): Promise<boolean> {
  const payload: Record<string, unknown> = { access_token: destino.accessToken, data: [evento] };
  if (destino.testEventCode) payload.test_event_code = destino.testEventCode;
  const nombre = `${evento.event_name} (${evento.event_id})`;
  try {
    const respuesta = await fetch('https://graph.facebook.com/v21.0/' + destino.pixelId + '/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!respuesta.ok) {
      logger.warn(`Meta rechazó ${nombre} (HTTP ${respuesta.status}): ${await respuesta.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    logger.error(`No se pudo mandar ${nombre} a Meta: ${err}`);
    return false;
  }
}
