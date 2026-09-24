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
      setOrderError('No se pudo iniciar el pago con Mercado Pago. Probá de nuevo o elegí otro método.');
    } catch (err) {
      setOrderError(mensajeDeError(err, 'Error al conectar con Mercado Pago. Probá de nuevo o elegí otro método.'));
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
    } catch (err) {
      // Antes, cualquier error acá se tragaba y se mostraba "pedido
      // confirmado" con un número inventado sin que la orden existiera.
      setOrderError(mensajeDeError(err, 'Hubo un error al procesar tu pedido. Intentá de nuevo.'));
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
