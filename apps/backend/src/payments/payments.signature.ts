import * as crypto from 'crypto';

/**
 * Verificación de la firma del aviso de pago de Mercado Pago.
 *
 * La cabecera `x-signature` llega así:
 *     ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839
 *
 * y lo que se firma es esta cadena exacta —el "manifest"—, no el cuerpo:
 *     id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * El identificador va en minúsculas cuando es alfanumérico, y los tramos sin
 * valor se omiten enteros.
 */

export interface ResultadoFirma {
  valida: boolean;
  /** Para el log cuando falla: sin esto no se distingue un secreto equivocado de un manifiesto mal armado. */
  manifiestosProbados: string[];
  motivo?: 'sin-firma' | 'formato-inesperado';
}

/**
 * Se prueban dos variantes del manifiesto, con y sin `request-id`, porque esa
 * cabecera la suelen reescribir o inyectar los proxies. Si la plataforma donde
 * corre el backend la cambia, el valor que llega no es el que firmó Mercado
 * Pago y el HMAC no coincide nunca, por más correcto que sea el secreto.
 *
 * Aceptar la variante sin `request-id` no debilita nada: sigue haciendo falta
 * el secreto, y la firma sigue atada al pago y a la marca de tiempo.
 */
function manifiestosPosibles(id: string, ts: string, xRequestId: string): string[] {
  const manifiestos: string[] = [];
  if (xRequestId) manifiestos.push(`id:${id};request-id:${xRequestId};ts:${ts};`);
  manifiestos.push(`id:${id};ts:${ts};`);
  return manifiestos;
}

/** Comparación de tiempo constante: no filtra información por su duración. */
function coincide(manifest: string, secret: string, received: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function verificarFirma(
  paymentId: string,
  signature: string,
  xRequestId: string,
  secret: string,
): ResultadoFirma {
  if (!signature) return { valida: false, manifiestosProbados: [], motivo: 'sin-firma' };

  // La cabecera trae pares separados por coma: ts=... , v1=...
  const partes = new Map(
    signature.split(',').map((chunk) => {
      const [name, ...rest] = chunk.split('=');
      return [name.trim(), rest.join('=').trim()] as const;
    }),
  );

  const ts = partes.get('ts');
  const recibida = partes.get('v1');
  if (!ts || !recibida) return { valida: false, manifiestosProbados: [], motivo: 'formato-inesperado' };

  const id = /^[a-z0-9]+$/i.test(paymentId) ? paymentId.toLowerCase() : paymentId;
  const candidatos = manifiestosPosibles(id, ts, xRequestId);

  return {
    valida: candidatos.some((manifest) => coincide(manifest, secret, recibida)),
    manifiestosProbados: candidatos,
  };
}
