/**
 * Lo que el navegador aporta a los eventos de Meta: en qué sitio está, las
 * cookies del Pixel (_fbp / _fbc) y, si se está probando, el código de
 * "Probar eventos".
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

const NOVENTA_DIAS_S = 90 * 86400;
const FORMATO = /^fb\.\d\.\d+\.[\w.-]+$/;

function leerCookie(nombre: string): string | undefined {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + nombre + '=([^;]*)'));
  const valor = match ? decodeURIComponent(match[1]) : undefined;
  return valor && FORMATO.test(valor) ? valor : undefined;
}

/**
 * Cookie propia del sitio, compartida entre www y el dominio sin www (como
 * las que crea el Pixel). En localhost va sin dominio.
 */
function guardarCookie(nombre: string, valor: string): void {
  const host = window.location.hostname;
  const dominio = host.includes('.') && !/^\d+(\.\d+)*$/.test(host) ? '; domain=.' + host.replace(/^www\./, '') : '';
  const segura = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; max-age=${NOVENTA_DIAS_S}; path=/; samesite=lax${dominio}${segura}`;
}

/**
 * Deja listas las cookies con las que Meta reconoce al navegador, antes del
 * primer evento:
 *  - `_fbp` (este navegador): si no existe, se crea con el formato de Meta.
 *    El Pixel la adopta en vez de crear otra. Sin esto los eventos por
 *    servidor llegaban solo con IP y navegador (calidad de coincidencia 3/10)
 *    cuando el Pixel no había cargado todavía o lo bloqueaba el navegador.
 *  - `_fbc` (clic en un anuncio): si la URL trae `fbclid`, se arma en el
 *    momento en vez de esperar al Pixel.
 */
export function prepararCookiesDeMeta(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!leerCookie('_fbp')) {
      const aleatorio = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000);
      guardarCookie('_fbp', `fb.1.${Date.now()}.${aleatorio}`);
    }
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    const actual = leerCookie('_fbc');
    if (fbclid && /^[\w.-]+$/.test(fbclid) && !actual?.endsWith('.' + fbclid)) {
      guardarCookie('_fbc', `fb.1.${Date.now()}.${fbclid}`);
    }
  } catch {
    // Cookies bloqueadas: los eventos salen igual, con menos datos.
  }
}

const CLAVE_PRUEBA = 'hp_meta_test';

/**
 * Código de "Probar eventos" de Meta para esta pestaña. Se activa entrando
 * con `?meta_test=CODIGO` y se apaga con `?meta_test=0`. El servidor solo lo
 * acepta si coincide con el cargado en el backoffice: con él, los eventos y la
 * compra van a "Probar eventos" y el pedido queda marcado como prueba.
 */
export function codigoDePruebaMeta(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const pedido = new URLSearchParams(window.location.search).get('meta_test');
    if (pedido === '0') sessionStorage.removeItem(CLAVE_PRUEBA);
    else if (pedido && /^[A-Za-z0-9]{1,40}$/.test(pedido)) sessionStorage.setItem(CLAVE_PRUEBA, pedido);
    return sessionStorage.getItem(CLAVE_PRUEBA) || undefined;
  } catch {
    return undefined;
  }
}

/** Lo que el navegador manda al servidor para Meta. Vacío fuera del navegador. */
export function idsDeMeta(): { fbp?: string; fbc?: string; testEventCode?: string } {
  if (typeof window === 'undefined') return {};
  const fbp = leerCookie('_fbp');
  const fbc = leerCookie('_fbc');
  const testEventCode = codigoDePruebaMeta();
  return { ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}), ...(testEventCode ? { testEventCode } : {}) };
}
