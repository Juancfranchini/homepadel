// Helper para disparar eventos de Meta Pixel (browser + CAPI) y del embudo
// propio del backoffice. Usa el mismo event_id para deduplicar entre
// navegador y servidor.

import api from './api';

type Datos = Record<string, unknown>;

interface EventoPendiente {
  eventName: string;
  eventData: Datos;
  customData: Datos;
  eventId: string;
  eventSourceUrl: string;
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

function enviar(evento: EventoPendiente) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', evento.eventName, evento.eventData, { eventID: evento.eventId });
  }
  // Va siempre al servidor, haya Pixel configurado o no: el embudo propio
  // del backoffice no depende de Meta.
  api.post('/track', {
    eventName: evento.eventName,
    eventId: evento.eventId,
    eventSourceUrl: evento.eventSourceUrl,
    pixelId: window.__metaPixelId,
    eventData: evento.eventData,
    customData: evento.customData,
  }).catch(() => {});
}

/**
 * `eventId` es opcional: por default se genera uno al azar. Un evento que
 * también se manda por CAPI desde el servidor con un id propio (como
 * Purchase — ver `enviarCompraAMeta` en el backend) tiene que pasar acá el
 * mismo id, para que Meta lo trate como un solo evento y no como dos.
 */
export function trackMetaEvent(
  eventName: string,
  eventData: Datos = {},
  customData: Datos = {},
  eventId: string = newEventId(),
) {
  if (typeof window === 'undefined') return;
  const evento = { eventName, eventData, customData, eventId, eventSourceUrl: window.location.href };
  if (!configLista) {
    pendientes.push(evento);
    return;
  }
  enviar(evento);
}

/** Lo llama MetaPixel al terminar de leer la configuración (haya Pixel o no): manda lo que quedó en espera. */
export function marcarConfigLista() {
  configLista = true;
  pendientes.splice(0).forEach(enviar);
}
