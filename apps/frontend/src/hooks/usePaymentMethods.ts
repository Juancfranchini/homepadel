'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BANK_TRANSFER_ENABLED = process.env.NEXT_PUBLIC_ENABLE_BANK_TRANSFER === 'true';

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
  correo_argentino?: PaymentMethodConfig;
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
    // Política pública actual: las configuraciones se conservan en el CMS,
    // pero no habilitan cobros directos desde la tienda.
    transferencia: { ...(data?.transferencia || {}), active: BANK_TRANSFER_ENABLED && data?.transferencia?.active === true },
    visa: { ...(data?.visa || {}), active: false },
    mastercard: { ...(data?.mastercard || {}), active: false },
    amex: { ...(data?.amex || {}), active: false },
    ca: data?.ca || data?.correo_argentino || { active: true },
    oca: data?.oca || { active: true },
    andreani: data?.andreani || { active: true },
    isLoaded: data !== null,
  };
}
