'use client';

import { useState, useEffect } from 'react';

interface Branding {
  logoHeader: string | null;
  logoFooter: string | null;
  isotipo: string | null;
  logoMobile: string | null;
  logoLogin: string | null;
  loaded: boolean;
}

function getImageUrl(baseUrl: string, path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return baseUrl + path;
}

export function useBranding() {
  const [branding, setBranding] = useState<Branding>({
    logoHeader: null,
    logoFooter: null,
    isotipo: null,
    logoMobile: null,
    logoLogin: null,
    loaded: false,
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = apiUrl.replace('/api', '');
    fetch(apiUrl + '/site-sections/branding')
      .then(res => res.json())
      .then(data => {
        const b = data?.data || data || {};
        setBranding({
          logoHeader: getImageUrl(baseUrl, b.logoHeader),
          logoFooter: getImageUrl(baseUrl, b.logoFooter),
          isotipo: getImageUrl(baseUrl, b.isotipo),
          logoMobile: getImageUrl(baseUrl, b.logoMobile),
          logoLogin: getImageUrl(baseUrl, b.logoLogin),
          loaded: true,
        });
      })
      .catch(() => setBranding(prev => ({ ...prev, loaded: true })));
  }, []);

  return branding;
}
