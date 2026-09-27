const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export type RespuestaServidor<T> = { ok: true; data: T } | { ok: false; status: number | null };

/**
 * GET a la API desde el servidor de Next (páginas y metadatos).
 *
 * No usa el cliente de axios de `lib/api` porque ese lee el token del
 * navegador y no participa de la caché de datos de Next: con `fetch` y
 * `revalidate`, la misma consulta que piden la página y sus metadatos en una
 * visita sale una sola vez, y las siguientes visitas no golpean la API.
 *
 * Nunca lanza: devuelve `ok: false` con el status (null si ni siquiera hubo
 * respuesta) para que cada página decida si es "no existe" o "falló".
 */
export async function getDesdeServidor<T>(ruta: string, revalidate: number): Promise<RespuestaServidor<T>> {
  try {
    const res = await fetch(API_URL + ruta, { next: { revalidate } });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, data: (await res.json()) as T };
  } catch (error) {
    console.error('[serverApi] GET ' + ruta + ' falló:', error);
    return { ok: false, status: null };
  }
}
