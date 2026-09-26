'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { validateCoupon } from '@/lib/api';

export interface CouponState {
  input: string;
  setInput: (value: string) => void;
  couponCode: string | null;
  discount: number;
  error: string;
  loading: boolean;
  apply: () => Promise<void>;
  remove: () => void;
}

function couponErrorMessage(error: unknown): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === 'string' ? message : 'Cupón inválido o vencido';
}

/** El descuento que devuelve es solo para mostrar: el servidor lo recalcula al crear la orden. */
export function useCoupon(subtotal: number): CouponState {
  const { couponCode, setCoupon } = useCartStore();
  const [input, setInput] = useState(couponCode ?? '');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Un cupón ya aplicado se revalida si cambia el carrito: puede dejar de cumplir el mínimo.
  useEffect(() => {
    if (!couponCode || subtotal <= 0) return;
    validateCoupon(couponCode, subtotal)
      .then((data) => setDiscount(data.discountAmount ?? 0))
      .catch(() => { setCoupon(null); setDiscount(0); });
  }, [couponCode, subtotal, setCoupon]);

  const apply = async () => {
    const code = input.trim();
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      const data = await validateCoupon(code, subtotal);
      setCoupon(data.code);
      setDiscount(data.discountAmount ?? 0);
    } catch (err: unknown) {
      setCoupon(null);
      setDiscount(0);
      setError(couponErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setCoupon(null);
    setDiscount(0);
    setInput('');
    setError('');
  };

  return { input, setInput, couponCode, discount, error, loading, apply, remove };
}
