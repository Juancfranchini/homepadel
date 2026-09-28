'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';

export interface FunnelCounts {
  PageView: number;
  ViewContent: number;
  AddToCart: number;
  InitiateCheckout: number;
  Purchase: number;
}

export interface DiaEmbudo {
  date: string;
  pageView: number;
  viewContent: number;
  addToCart: number;
  initiateCheckout: number;
  purchase: number;
}

export interface ProductoRanking {
  productId: string;
  productName: string;
  count: number;
}

export interface MarketingStats {
  funnel: FunnelCounts;
  conversion: {
    viewContentDePageView: number;
    addToCartDeViewContent: number;
    checkoutDeAddToCart: number;
    compraDeCheckout: number;
    compraDePageView: number;
  };
  daily: DiaEmbudo[];
  topViewed: ProductoRanking[];
  topAddedToCart: ProductoRanking[];
  /** Primer evento registrado (ISO). Antes de esa fecha el seguimiento no existía. */
  registrandoDesde: string | null;
}

export function useMarketingStats() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (dias: number) => {
    setLoading(true);
    try {
      const { data } = await api.get<MarketingStats>('/marketing/stats', { params: { days: dias } });
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  return { stats, loading, days, setDays };
}
