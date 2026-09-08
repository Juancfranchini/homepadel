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

export function trackMetaEvent(eventName: string, eventData: Record<string, any> = {}, customData: Record<string, any> = {}) {
  const eventId = newEventId();

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