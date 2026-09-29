'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { marcarConfigLista, trackMetaEvent } from '@/lib/metaPixel';
import { modoPruebaActivo } from '@/lib/modoPrueba';
import { codigoDePruebaMeta, esSitioDeProduccion, prepararCookiesDeMeta } from '@/lib/metaNavegador';
import { useAuthStore } from '@/store/authStore';

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

/**
 * El código base del Pixel, tal cual lo da Meta. Antes se usaba una versión
 * reescrita a mano que no definía `window._fbq`, y el Pixel del navegador
 * nunca mandó un evento desde este sitio: todo entraba solo por el servidor.
 */
const CODIGO_BASE_PIXEL =
  "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};" +
  "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;" +
  "s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');";

function instalarPixel(pixelId: string) {
  const base = document.createElement('script');
  base.text = CODIGO_BASE_PIXEL;
  document.head.appendChild(base);

  // La página no se recarga al navegar: el PageView de cada ruta lo manda
  // trackMetaEvent, con el mismo id que el servidor.
  window.fbq.disablePushState = true;
  // Coincidencia avanzada: con sesión, el email va al Pixel (lo cifra el propio Pixel).
  const email = useAuthStore.getState().user?.email;
  window.fbq('init', pixelId, email ? { em: email.trim().toLowerCase() } : {});
}

export default function MetaPixel() {
  const pathname = usePathname();
  const instalado = useRef(false);
  const ultimaRuta = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      prepararCookiesDeMeta();
      const config = await leerConfig();

      // Solo en la tienda de producción, y nunca en modo prueba ni probando
      // eventos de Meta: fuera de ahí (localhost, previews, dominios viejos)
      // los eventos van a Meta solo como prueba y desde el servidor (ver /track).
      if (config.pixelId && !instalado.current && !modoPruebaActivo() && !codigoDePruebaMeta() && esSitioDeProduccion()) {
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
