/**
 * Lo que el navegador aporta a los eventos de Meta: en qué sitio está y las
 * cookies del Pixel (_fbp / _fbc).
 *
 * El API vive en otro dominio que la tienda, así que esas cookies no viajan
 * solas en los pedidos al servidor: se leen acá y se mandan en el cuerpo.
 */

/** Dominios donde se instala el Pixel: `NEXT_PUBLIC_META_PIXEL_HOSTS` (separados por coma) o la tienda de producción. */
function hostsDeProduccion(): string[] {
  return (process.env.NEXT_PUBLIC_META_PIXEL_HOSTS || 'www.homepadel.com.ar')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

/** Solo la tienda de producción manda eventos reales a Meta (localhost, previews y dominios viejos, no). */
export function esSitioDeProduccion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:' && hostsDeProduccion().includes(window.location.hostname.toLowerCase());
}

const NOVENTA_DIAS_MS = 90 * 86400000;
const CLAVE_FBC = 'hp_fbc';
const FORMATO = /^fb\.\d\.\d+\.[\w.-]+$/;

function leerCookie(nombre: string): string | undefined {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + nombre + '=([^;]*)'));
  const valor = match ? decodeURIComponent(match[1]) : undefined;
  return valor && FORMATO.test(valor) ? valor : undefined;
}

/**
 * Quien llega desde un anuncio trae `fbclid` en la URL. El Pixel lo convierte
 * en la cookie _fbc, pero recién cuando termina de cargar: el primer evento
 * salía sin ese dato. Se guarda acá (vale 90 días, como la cookie).
 */
export function capturarClicDeAnuncio(): void {
  if (typeof window === 'undefined') return;
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (!fbclid || !/^[\w.-]+$/.test(fbclid)) return;
    localStorage.setItem(CLAVE_FBC, JSON.stringify({ fbc: `fb.1.${Date.now()}.${fbclid}`, hasta: Date.now() + NOVENTA_DIAS_MS }));
  } catch {
    // Sin almacenamiento: queda la cookie del Pixel.
  }
}

function fbcGuardado(): string | undefined {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_FBC) || 'null') as { fbc?: string; hasta?: number } | null;
    return guardado?.fbc && (guardado.hasta ?? 0) > Date.now() && FORMATO.test(guardado.fbc) ? guardado.fbc : undefined;
  } catch {
    return undefined;
  }
}

/** Cookies del Pixel para mandar al servidor. Vacío fuera del navegador o si todavía no existen. */
export function idsDeMeta(): { fbp?: string; fbc?: string } {
  if (typeof window === 'undefined') return {};
  const fbp = leerCookie('_fbp');
  const fbc = leerCookie('_fbc') || fbcGuardado();
  return { ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}) };
}
