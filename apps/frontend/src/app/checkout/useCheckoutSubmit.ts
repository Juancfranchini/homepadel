'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
import { createOrder } from '@/lib/api';

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: 'card' | 'mercadopago' | 'transfer';
}

interface Params {
  items: CartItem[];
  couponCode: string | null;
  clearCart: () => void;
}

export function useCheckoutSubmit({ items, couponCode, clearCart }: Params) {
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderError, setOrderError] = useState('');

  const submitMercadoPago = async (data: CheckoutFormData) => {
    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        variantId: i.variantId,
        variantSku: i.variantSku,
        variantSize: i.variantSize,
        variantColor: i.variantColor,
        variantDimensions: i.variantDimensions,
      }));
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(API_URL + '/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: 'HP-' + Date.now(),
          items: orderItems,
          payer: { name: data.name, email: data.email },
          externalReference: 'order_' + Date.now(),
          couponCode: couponCode || undefined,
        }),
      });
      const pref = await res.json();
      if (pref?.init_point) {
        window.location.href = pref.init_point;
        return;
      }
      setOrderError('No se pudo iniciar el pago con Mercado Pago. Probá de nuevo o elegí otro método.');
    } catch (err) {
      console.error('Error MP:', err);
      setOrderError('Error al conectar con Mercado Pago. Probá de nuevo o elegí otro método.');
    }
  };

  const submitDirectOrder = async (data: CheckoutFormData) => {
    try {
      const address = data.street + ', ' + data.city + ', ' + data.province + ' (' + data.postalCode + ')';
      // Solo lo que declara CreateOrderDto en el backend: con
      // forbidNonWhitelisted activado, un campo de más (como un `total`
      // calculado acá) hace que el pedido entero se rechace con 400.
      const orderData = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          variantId: i.variantId,
        })),
        address,
        buyerEmail: data.email,
        buyerPhone: data.phone,
        buyerName: data.name,
        couponCode: couponCode || undefined,
      };
      const result = await createOrder(orderData);
      setOrderNumber(result.number);
      clearCart();
      setOrderSuccess(true);
    } catch (err: any) {
      // Antes, cualquier error acá se tragaba y se mostraba "pedido
      // confirmado" con un número inventado sin que la orden existiera.
      setOrderError(err?.response?.data?.message || 'Hubo un error al procesar tu pedido. Intentá de nuevo.');
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setOrderError('');
    if (data.paymentMethod === 'mercadopago') {
      await submitMercadoPago(data);
      return;
    }
    await submitDirectOrder(data);
  };

  return { onSubmit, orderSuccess, orderNumber, orderError };
}
