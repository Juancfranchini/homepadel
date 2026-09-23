'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface SiteSettings {
  storeName?: string;
  phone?: string;
  whatsapp?: string;
  contactEmail?: string;
  address?: string;
}

/**
 * Datos de contacto del negocio, administrados desde el backoffice.
 *
 * No hay valores de relleno a propósito: si un dato no está cargado, la vista
 * que lo usa tiene que omitirlo. Publicar un teléfono o una dirección inventados
 * es peor que no mostrar nada, porque el visitante los toma por buenos.
 */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    fetch(API_URL + '/site-sections/settings')
      .then((r) => r.json())
      .then((res) => setSettings(res?.data || res || {}))
      .catch(() => {});
  }, []);

  return settings;
}

/**
 * Arma el enlace de WhatsApp a partir del número guardado en la configuración.
 *
 * El backoffice acepta el número en el formato que resulte cómodo —"11 4083-2310",
 * "+54 9 11 4083 2310"—, pero wa.me exige solo dígitos y con código de país. Si el
 * número ya viene con el 54 se respeta; si no, se asume Argentina.
 *
 * Devuelve null cuando no hay número cargado, para que quien lo use no dibuje un
 * botón que no lleva a ningún lado.
 */
export function buildWhatsappUrl(rawNumber?: string, message?: string): string | null {
  const digits = (rawNumber || '').replace(/\D/g, '');
  if (!digits) return null;

  const withCountryCode = digits.startsWith('54') ? digits : '549' + digits;
  const query = message ? '?text=' + encodeURIComponent(message) : '';
  return 'https://wa.me/' + withCountryCode + query;
}
