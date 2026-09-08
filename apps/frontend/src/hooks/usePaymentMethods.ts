'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function usePaymentMethods() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(API_URL + '/site-sections/payment_methods')
      .then((r) => r.json())
      .then((res) => setData(res?.data || res))
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
