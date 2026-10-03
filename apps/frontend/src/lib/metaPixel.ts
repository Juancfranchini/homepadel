// Helper para disparar eventos de Meta Pixel (browser + CAPI) y del embudo
// propio del backoffice. Usa el mismo event_id para deduplicar entre
// navegador y servidor.
//
// Quien decide si un evento cuenta es el servidor (/track): producción o no,
// cuenta de prueba o no. El Pixel del navegador sale solo si el servidor
// responde `pixel: true`, así Meta y el backoffice reciben lo mismo.

import api from './api';
import { modoPruebaActivo } from './modoPrueba';
import { idsDeMeta } from './metaNavegador';
import { leerContacto } from './contactoComprador';
import { useAuthStore } from '@/store/authStore';

type Datos = Record<string, unknown>;

/** Email y teléfono del comprador: el servidor los cifra antes de mandarlos a Meta y no los guarda. */
export interface DatosComprador {
  email?: string | null;
  phone?: string | null;
}

interface EventoPendiente {
  eventName: string;
  eventData: Datos;
  customData: Datos;
  eventId: string;
  eventSourceUrl: string;
  userData?: DatosComprador;
}

export function newEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

// Un evento que se dispara antes de que MetaPixel termine de leer la
// configuración se perdía: entrando directo a un producto (lo típico de
// quien llega desde un anuncio, Google o WhatsApp), la vista del producto
// salía antes que la config y se descartaba sin avisar. Ahora queda en
// espera y sale apenas la config está lista.
let configLista = false;
const pendientes: EventoPendiente[] = [];

/**
 * Email y teléfono para reconocer a la persona, en este orden: los del evento,
 * los que escribió en el checkout en esta visita (ver contactoComprador.ts)
 * o los de la cuenta con sesión. El servidor también los toma del token;
 * mandarlos acá cubre al que tiene la sesión guardada pero el token vencido.
 */
function datosDeLaPersona(evento: EventoPendiente): DatosComprador | undefined {
  if (evento.userData?.email || evento.userData?.phone) return evento.userData;
  const escrito = leerContacto();
  if (escrito) return escrito;
  const cuenta = useAuthStore.getState().user;
  return cuenta ? { email: cuenta.email, phone: cuenta.phone } : undefined;
}

async function enviar(evento: EventoPendiente) {
  try {
    const persona = datosDeLaPersona(evento);
    const { data } = await api.post<{ pixel?: boolean }>('/track', {
      eventName: evento.eventName,
      eventId: evento.eventId,
      eventSourceUrl: evento.eventSourceUrl,
      eventData: evento.eventData,
      customData: evento.customData,
      ...idsDeMeta(),
      ...(persona?.email || persona?.phone
        ? { userData: { email: persona.email || undefined, phone: persona.phone || undefined } }
        : {}),
    });
    if (data?.pixel && typeof window.fbq === 'function') {
      window.fbq('track', evento.eventName, evento.eventData, { eventID: evento.eventId });
    }
  } catch {
    // Sin servidor no se sabe si el evento cuenta: no se manda por ningún lado.
  }
}

/**
 * `eventId` es opcional: por default se genera uno al azar, y el mismo id va
 * al Pixel y a la API de Conversiones para que Meta cuente uno solo. La
 * compra (Purchase) no sale de acá: la informa el servidor al confirmarse el
 * pago.
 */
export function trackMetaEvent(
  eventName: string,
  eventData: Datos = {},
  customData: Datos = {},
  eventId: string = newEventId(),
  userData?: DatosComprador,
) {
  if (typeof window === 'undefined' || modoPruebaActivo()) return;
  const evento = { eventName, eventData, customData, eventId, eventSourceUrl: window.location.href, userData };
  if (!configLista) {
    pendientes.push(evento);
    return;
  }
  void enviar(evento);
}

/** Lo llama MetaPixel al terminar de leer la configuración (haya Pixel o no): manda lo que quedó en espera. */
export function marcarConfigLista() {
  configLista = true;
  pendientes.splice(0).forEach((evento) => void enviar(evento));
}
