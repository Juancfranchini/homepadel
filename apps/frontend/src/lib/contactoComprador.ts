import type { DatosComprador } from './metaPixel';

/**
 * Mail y teléfono que la persona escribió en el checkout, guardados en esta
 * pestaña para que viajen (cifrados por el servidor) con los eventos que
 * siguen: AddPaymentInfo y los de cualquier vuelta al sitio en la misma
 * visita. Sin esto, quien compra sin cuenta llegaba a Meta sin ningún dato
 * para reconocerlo y la calidad de coincidencia quedaba en 3/10.
 *
 * sessionStorage y no localStorage: se borra al cerrar la pestaña y no queda
 * en una compu compartida.
 */

const CLAVE = 'hp_contacto_checkout';
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function guardarContacto(email?: string | null, telefono?: string | null): void {
  const mail = email?.trim().toLowerCase() || '';
  const tel = (telefono || '').replace(/[^\d+]/g, '');
  const datos: DatosComprador = {
    ...(EMAIL_VALIDO.test(mail) ? { email: mail } : {}),
    ...(tel.replace(/\D/g, '').length >= 8 ? { phone: tel } : {}),
  };
  if (!datos.email && !datos.phone) return;
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento: los eventos salen igual, solo sin estos datos.
  }
}

export function leerContacto(): DatosComprador | null {
  try {
    const datos = JSON.parse(sessionStorage.getItem(CLAVE) || 'null') as DatosComprador | null;
    return datos?.email || datos?.phone ? datos : null;
  } catch {
    return null;
  }
}
