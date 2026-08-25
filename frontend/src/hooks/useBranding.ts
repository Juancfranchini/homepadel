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
          logoHeader: b.logoHeader ? baseUrl + b.logoHeader : null,
          logoFooter: b.logoFooter ? baseUrl + b.logoFooter : null,
          isotipo: b.isotipo ? baseUrl + b.isotipo : null,
          logoMobile: b.logoMobile ? baseUrl + b.logoMobile : null,
          logoLogin: b.logoLogin ? baseUrl + b.logoLogin : null,
          loaded: true,
        });
      })
      .catch(() => setBranding(prev => ({ ...prev, loaded: true })));
  }, []);

  return branding;
}