// Helper para disparar eventos de Meta Pixel (browser + CAPI)
// Usa el mismo event_id para deduplicar entre navegador y servidor

import api from './api';

export interface MetaEventData {
  eventName: string;
  eventData?: Record<string, any>;
  customData?: Record<string, any>;
}

export function newEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

/**
 * `eventId` es opcional: por default se genera uno al azar. Un evento que
 * también se manda por CAPI desde el servidor con un id propio (como
 * Purchase — ver `enviarCompraAMeta` en el backend) tiene que pasar acá el
 * mismo id, para que Meta lo trate como un solo evento y no como dos.
 */
export function trackMetaEvent(
  eventName: string,
  eventData: Record<string, any> = {},
  customData: Record<string, any> = {},
  eventId: string = newEventId(),
) {

  // Browser (Pixel)
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, eventData, { eventID: eventId });
  }

  // Server (CAPI)
  try {
    const pixelId = (window as any).__metaPixelId;
    if (pixelId) {
      api.post('/track', {
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        pixelId,
        eventData,
        customData,
      }).catch(() => {});
    }
  } catch {}
}