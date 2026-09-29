import type { Request } from 'express';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/** Formato de las cookies del Pixel: fb.<subdominio>.<milisegundos>.<valor>. */
const COOKIE_PIXEL = /^fb\.\d\.\d+\.[\w.-]+$/;

/**
 * Cookies del Pixel que manda el navegador en el cuerpo del pedido. El API
 * vive en otro dominio que la tienda, así que las cookies _fbp/_fbc de
 * www.homepadel.com.ar no viajan solas en el request: el navegador las lee y
 * las manda. Un valor con otro formato se rechaza.
 */
export class MetaNavegadorDto {
  @IsOptional() @IsString() @MaxLength(255) @Matches(COOKIE_PIXEL) fbp?: string;
  @IsOptional() @IsString() @MaxLength(255) @Matches(COOKIE_PIXEL) fbc?: string;
  /** Código de "Probar eventos" de Meta (`?meta_test=`). Solo cuenta si coincide con el del backoffice: ver meta-destino.ts. */
  @IsOptional() @IsString() @MaxLength(40) @Matches(/^[A-Za-z0-9]+$/) testEventCode?: string;
}

/**
 * Lo que Meta necesita del navegador de quien compra o navega. Se guarda con
 * el pedido para poder informar la compra más tarde, cuando Mercado Pago
 * confirme el pago (su aviso no trae nada de esto).
 */
export interface ClienteMeta {
  /** Sitio desde el que se hizo el pedido: decide si el evento es de producción. */
  origen?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  /** Código de "Probar eventos" con el que se hizo el pedido, si se estaba probando. */
  testEventCode?: string;
}

function cookie(cookies: string, nombre: string): string | undefined {
  const match = cookies.match(new RegExp('(?:^|;\\s*)' + nombre + '=([^;]*)'));
  const valor = match ? decodeURIComponent(match[1]) : undefined;
  return valor && COOKIE_PIXEL.test(valor) ? valor : undefined;
}

/** Origen del sitio: el header Origin (lo pone el navegador, una página no lo puede cambiar) o, si falta, el del Referer. */
function origenDe(req: Request): string | undefined {
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin !== 'null') return origin;
  try {
    return req.headers.referer ? new URL(req.headers.referer).origin : undefined;
  } catch {
    return undefined;
  }
}

export function clienteDesdeRequest(req: Request, navegador?: MetaNavegadorDto): ClienteMeta {
  const cookies = req.headers.cookie || '';
  // Detrás de proxies llega como lista ("cliente, proxy"): Meta espera una sola IP, la del cliente.
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || undefined;
  const cliente: ClienteMeta = {
    origen: origenDe(req),
    ip,
    userAgent: req.headers['user-agent'] || undefined,
    fbp: navegador?.fbp || cookie(cookies, '_fbp'),
    fbc: navegador?.fbc || cookie(cookies, '_fbc'),
    testEventCode: navegador?.testEventCode,
  };
  return Object.fromEntries(Object.entries(cliente).filter(([, v]) => v)) as ClienteMeta;
}
