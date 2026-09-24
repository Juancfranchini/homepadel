'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface PaymentMethodConfig {
  active?: boolean;
  logo?: string;
}

interface PaymentMethodsData {
  mercadopago?: PaymentMethodConfig;
  transferencia?: PaymentMethodConfig;
  visa?: PaymentMethodConfig;
  mastercard?: PaymentMethodConfig;
  amex?: PaymentMethodConfig;
  ca?: PaymentMethodConfig;
  oca?: PaymentMethodConfig;
  andreani?: PaymentMethodConfig;
}

function parsePaymentMethods(response: unknown): PaymentMethodsData {
  if (!response || typeof response !== 'object') return {};
  const wrapped = response as { data?: unknown };
  const value = wrapped.data ?? response;
  return value && typeof value === 'object' ? value as PaymentMethodsData : {};
}

export function usePaymentMethods() {
  const [data, setData] = useState<PaymentMethodsData | null>(null);

  useEffect(() => {
    fetch(API_URL + '/site-sections/payment_methods')
      .then((r) => r.json())
      .then((res: unknown) => setData(parsePaymentMethods(res)))
      .catch(() => {});
  }, []);

  return {
    mercadopago: data?.mercadopago || { active: true },
    transferencia: data?.transferencia || { active: true },
    visa: data?.visa || { active: true },
    mastercard: data?.mastercard || { active: true },
    amex: data?.amex || { active: true },
    ca: data?.ca || { active: true },
    oca: data?.oca || { active: true },
    andreani: data?.andreani || { active: true },
    isLoaded: data !== null,
  };
}
