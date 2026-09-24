'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
import { createOrder, createPaymentPreference } from '@/lib/api';
import { CheckoutFormData } from './checkoutSchema';

/**
 * El backend valida con class-validator, que devuelve un array de mensajes
 * cuando falla más de un campo. Mostrarlo tal cual dejaba "[object Object]".
 */
function mensajeDeError(err: unknown, porDefecto: string): string {
  const detalle = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(detalle)) return detalle.join('. ');
  return typeof detalle === 'string' ? detalle : porDefecto;
}

interface Params {
  items: CartItem[];
  couponCode: string | null;
  clearCart: () => void;
}

export function useCheckoutSubmit({ items, couponCode, clearCart }: Params) {
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

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
      // El domicilio y el teléfono viajan con la preferencia: el aviso de pago
      // de Mercado Pago no los trae, así que si no se mandan acá la venta se
      // registra sin dirección a la que enviar. El número de orden lo genera
      // el servidor.
      const pref = await createPaymentPreference({
        items: orderItems,
        payer: { name: data.name, email: data.email },
        shipping: {
          street: data.street,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          phone: data.phone,
        },
        couponCode: couponCode || undefined,
      });
      if (pref?.init_point) {
        window.location.href = pref.init_point;
        return;
      }
      setOrderError('No se pudo iniciar el pago con Mercado Pago. Probá de nuevo.');
    } catch (err) {
      setOrderError(mensajeDeError(err, 'Error al conectar con Mercado Pago. Probá de nuevo.'));
    }
  };

  const submitTransfer = async (data: CheckoutFormData) => {
    try {
      const result = await createOrder({
        paymentMethod: 'transfer',
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, variantId: item.variantId })),
        address: data.street + ', ' + data.city + ', ' + data.province + ' (' + data.postalCode + ')',
        buyerEmail: data.email,
        buyerPhone: data.phone,
        buyerName: data.name,
        couponCode: couponCode || undefined,
      });
      setOrderNumber(result.number);
      clearCart();
      setOrderSuccess(true);
    } catch (err) {
      setOrderError(mensajeDeError(err, 'No pudimos registrar el pedido por transferencia. Probá de nuevo.'));
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setOrderError('');
    if (data.paymentMethod === 'transfer') {
      await submitTransfer(data);
      return;
    }
    await submitMercadoPago(data);
  };

  return { onSubmit, orderError, orderSuccess, orderNumber };
}
