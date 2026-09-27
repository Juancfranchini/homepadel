'use client';

import { useSiteSettings, buildWhatsappUrl } from '@/hooks/useSiteSettings';
import { trackMetaEvent } from '@/lib/metaPixel';

const MENSAJE = 'Hola! Tengo una consulta sobre un producto de Home Pádel.';

/**
 * Botón flotante de WhatsApp, visible en todo el sitio.
 * Sin número cargado en el backoffice no se dibuja: llevaría a ningún lado.
 */
export default function WhatsAppFloat() {
  const settings = useSiteSettings();
  const url = buildWhatsappUrl(settings.whatsapp || settings.phone, MENSAJE);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      onClick={() => trackMetaEvent('Contact', { content_type: 'whatsapp_flotante' })}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C8.86 3 3.03 8.82 3.03 15.99c0 2.29.6 4.53 1.74 6.51L3 29l6.68-1.74a13 13 0 0 0 6.36 1.62h.01c7.17 0 13-5.83 13-13S23.21 3 16.04 3Zm0 23.67h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.23-3.96 1.03 1.06-3.86-.26-.4a10.72 10.72 0 0 1-1.65-5.72c0-5.95 4.84-10.8 10.8-10.8a10.8 10.8 0 0 1 10.79 10.81c0 5.96-4.85 10.67-10.87 10.67Zm5.92-8.09c-.32-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.74.16-.21.32-.85 1.06-1.04 1.28-.19.21-.38.24-.71.08-.32-.16-1.37-.5-2.6-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.5.14-.66.15-.14.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.21 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.69s1.16 3.12 1.32 3.34c.16.21 2.28 3.48 5.53 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.93-.79 2.2-1.55.27-.77.27-1.42.19-1.56-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
