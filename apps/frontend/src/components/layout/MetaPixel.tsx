'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { marcarConfigLista, trackMetaEvent } from '@/lib/metaPixel';
import { modoPruebaActivo } from '@/lib/modoPrueba';
import { capturarClicDeAnuncio, esSitioDeProduccion } from '@/lib/metaNavegador';

interface MetaPixelConfig {
  pixelId?: string;
  events?: { pageView?: boolean };
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

async function leerConfig(): Promise<MetaPixelConfig> {
  try {
    const res = await api.get('/site-sections/meta_pixel');
    return res.data?.data || res.data || {};
  } catch {
    return {};
  }
}

function instalarPixel(pixelId: string) {
  // Stub oficial de Meta: se reemplaza a sí mismo al cargar fbevents.js, tiparlo no aporta nada.
  const f: any = function (...args: unknown[]) {
    if (f.callMethod) f.callMethod(...args);
    else f.queue.push(args);
  };
  f.push = f;
  f.loaded = true;
  f.version = '2.0';
  f.queue = [];
  window.fbq = f;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const primero = document.getElementsByTagName('script')[0];
  primero.parentNode!.insertBefore(script, primero);

  window.fbq.disablePushState = true;
  window.fbq('consent', 'revoke');
  window.fbq('init', pixelId);
  window.fbq('consent', 'grant');
}

export default function MetaPixel() {
  const pathname = usePathname();
  const instalado = useRef(false);
  const ultimaRuta = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      capturarClicDeAnuncio();
      const config = await leerConfig();

      // Solo en la tienda de producción, y nunca en modo prueba: fuera de ahí
      // (localhost, previews, dominios viejos) los eventos van a Meta solo
      // como prueba y desde el servidor (ver /track).
      if (config.pixelId && !instalado.current && !modoPruebaActivo() && esSitioDeProduccion()) {
        instalarPixel(config.pixelId);
        instalado.current = true;
      }

      // Haya Pixel o no: los eventos que se dispararon mientras se leía la
      // config (por ejemplo la vista del producto al entrar directo) salen ahora.
      marcarConfigLista();

      if (config.events?.pageView !== false && ultimaRuta.current !== pathname) {
        ultimaRuta.current = pathname;
        trackMetaEvent('PageView');
      }
    };

    init();
  }, [pathname]);

  return null;
}
