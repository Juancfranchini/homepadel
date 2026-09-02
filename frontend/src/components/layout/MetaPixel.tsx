'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';

interface MetaPixelConfig {
  pixelId: string;
  events: {
    pageView: boolean;
    viewContent: boolean;
    addToCart: boolean;
    initiateCheckout: boolean;
    purchase: boolean;
    contact: boolean;
  };
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    __metaPixelId?: string;
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/site-sections/meta_pixel');
        const section = res.data?.data ? res.data : res.data;
        const config: MetaPixelConfig = section?.data || section || {};

        if (!config.pixelId) return;

        window.__metaPixelId = config.pixelId;

        if (!initialized.current) {
          const f: any = function (...args: any[]) {
            if (f.callMethod) {
              f.callMethod.apply(f, args);
            } else {
              f.queue.push(args);
            }
          };

          f.push = f;
          f.loaded = true;
          f.version = '2.0';
          f.queue = [];

          window.fbq = f;

          const t = document.createElement('script');
          t.async = true;
          t.src = 'https://connect.facebook.net/en_US/fbevents.js';
          const s = document.getElementsByTagName('script')[0];
          s.parentNode!.insertBefore(t, s);
        }

        if (typeof window.fbq === 'function') {
          if (!initialized.current) {
            window.fbq.disablePushState = true;
            window.fbq('consent', 'revoke');
            window.fbq('init', config.pixelId);
            window.fbq('consent', 'grant');
            initialized.current = true;
          }

          if (config.events?.pageView !== false && lastTrackedPath.current !== pathname) {
            lastTrackedPath.current = pathname;
            const eventId = typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2);

            window.fbq('track', 'PageView', {}, { eventID: eventId });

            api.post('/track', {
              eventName: 'PageView',
              eventId,
              eventSourceUrl: window.location.href,
              pixelId: config.pixelId,
            }).catch(() => {});
          }
        }
      } catch {}
    };

    init();
  }, [pathname]);

  return null;
}