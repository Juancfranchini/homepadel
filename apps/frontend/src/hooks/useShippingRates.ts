'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ShippingRates {
  flatRate: number;
  freeShippingThreshold: number;
  isLoaded: boolean;
}

const DEFAULTS = { flatRate: 4500, freeShippingThreshold: 100000 };

/**
 * Tarifa de envío configurada en el backoffice. El monto final que se cobra
 * siempre lo recalcula el servidor (PricingService.calculateShipping) — esto
 * es solo para mostrar una estimación consistente antes de confirmar.
 */
export function useShippingRates(): ShippingRates {
  const [data, setData] = useState<{ flatRate: number; freeShippingThreshold: number } | null>(null);

  useEffect(() => {
    fetch(API_URL + '/site-sections/shipping_rates')
      .then((r) => r.json())
      .then((res) => setData(res?.data || res))
      .catch(() => {});
  }, []);

  return {
    flatRate: data?.flatRate ?? DEFAULTS.flatRate,
    freeShippingThreshold: data?.freeShippingThreshold ?? DEFAULTS.freeShippingThreshold,
    isLoaded: data !== null,
  };
}
