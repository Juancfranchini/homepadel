/**
 * Qué orígenes puede aceptar el backend por CORS.
 *
 * Dominios propios de la tienda, fijos en el código.
 *
 * Hasta el 26/09/2026 esto dependía de que `FRONTEND_URL` tuviera exactamente
 * el dominio que la gente estaba visitando en ese momento. Al mudar el sitio
 * de homepadel.store a homepadel.com.ar, cambiar esa variable al dominio
 * nuevo antes de que el DNS terminara de propagar dejó afuera a
 * homepadel.store —que seguía siendo el que recibía las visitas reales— y se
 * cayó todo lo que depende del backend: envíos, medios de pago, Instagram, la
 * configuración general.
 *
 * No son datos sensibles —son los dominios públicos del sitio—, así que
 * conviene tenerlos acá en vez de en una sola variable de entorno que hay que
 * mantener perfectamente sincronizada con el dominio de turno durante
 * cualquier migración futura.
 */
export const DOMINIOS_PROPIOS = [
  'https://homepadel.store',
  'https://www.homepadel.store',
  'https://homepadel.com.ar',
  'https://www.homepadel.com.ar',
];

/**
 * Decide si un origen puede pasar el CORS, en producción.
 *
 * `frontendUrl` y `backofficeUrl` son las variables de entorno del mismo
 * nombre: siguen sumándose a la lista fija, así que una preview de Vercel con
 * otra URL, o un entorno de staging, se puede seguir habilitando sin tocar
 * código.
 */
export function esOrigenPermitido(
  origin: string | undefined,
  env: { frontendUrl?: string; backofficeUrl?: string },
): boolean {
  // Sin origen (curl, Postman, llamadas server-side) — permitir.
  if (!origin) return true;

  const permitidos = [
    ...DOMINIOS_PROPIOS,
    env.frontendUrl,
    env.backofficeUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter((valor): valor is string => Boolean(valor));

  // Acepta cualquier subdominio de vercel.app (previews incluidas).
  return permitidos.includes(origin) || origin.endsWith('.vercel.app');
}
