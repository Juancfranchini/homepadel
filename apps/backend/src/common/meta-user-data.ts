import * as crypto from 'crypto';

/**
 * Datos del comprador para la API de Conversiones de Meta: mejoran la
 * "calidad de coincidencia" (Meta reconoce a quién corresponde el evento).
 *
 * Meta exige que el email y el teléfono viajen cifrados con SHA-256 y
 * normalizados de una forma exacta: si no, el cifrado no coincide con el
 * que Meta tiene guardado y el dato no sirve. Nunca se mandan en claro.
 */

const sha256 = (valor: string) => crypto.createHash('sha256').update(valor).digest('hex');

function normalizarEmail(email: string): string | null {
  const limpio = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio) ? limpio : null;
}

/**
 * Teléfono argentino en formato internacional, solo dígitos. Los celulares
 * argentinos existen con y sin el 9 después del 54 (+54 9 11… / +54 11…),
 * y no se sabe cuál tiene Meta, así que se mandan las dos variantes: Meta
 * acepta varias y usa la que coincida.
 */
export function variantesTelefono(telefono: string): string[] {
  let digitos = telefono.replace(/\D/g, '').replace(/^00/, '');
  if (!digitos) return [];
  if (!digitos.startsWith('54')) digitos = '54' + digitos.replace(/^0+/, '');
  const nacional = digitos.slice(2).replace(/^9/, '');
  if (nacional.length < 8 || nacional.length > 11) return [];
  return ['549' + nacional, '54' + nacional];
}

export interface DatosComprador {
  emails?: (string | null | undefined)[];
  telefono?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

/** Arma el `user_data` de Meta con los datos ya normalizados y cifrados. Omite lo que no haya. */
export function userDataParaMeta({ emails = [], telefono, ip, userAgent }: DatosComprador): Record<string, unknown> {
  const em = [...new Set(emails.map((e) => (e ? normalizarEmail(e) : null)).filter((e): e is string => !!e))].map(sha256);
  const ph = telefono ? variantesTelefono(telefono).map(sha256) : [];
  return {
    ...(em.length > 0 ? { em } : {}),
    ...(ph.length > 0 ? { ph } : {}),
    ...(ip ? { client_ip_address: ip } : {}),
    ...(userAgent ? { client_user_agent: userAgent } : {}),
  };
}
