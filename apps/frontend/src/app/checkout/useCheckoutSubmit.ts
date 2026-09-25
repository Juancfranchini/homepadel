'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
import { createOrder, createPaymentPreference } from '@/lib/api';
import { buildWhatsappUrl } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/utils';
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
  salesLinkToken: string | null;
  clearCart: () => void;
  whatsapp?: string;
}

function shippingCoordinationMessage(data: CheckoutFormData, items: CartItem[], couponCode: string | null): string {
  const carrier = data.shippingMethod === 'andreani' ? 'Andreani' : 'OCA';
  const itemLines = items.map((item) => {
    const variant = [item.variantSize, item.variantColor, item.variantDimensions].filter(Boolean).join(' / ');
    return `- ${item.quantity} x ${item.product.name}${variant ? ` (${variant})` : ''}`;
  });
  const subtotal = items.reduce((sum, item) => sum + item.product.effectivePrice * item.quantity, 0);
  return [
    `Hola, quiero coordinar el envío por ${carrier}.`, '', 'Detalle del pedido:', ...itemLines,
    `Subtotal de productos: ${formatPrice(subtotal)}`,
    ...(couponCode ? [`Cupón aplicado: ${couponCode}`] : []), '',
    `Cliente: ${data.name}`, `Email: ${data.email}`, `Teléfono: ${data.phone}`,
    `Entrega: ${data.street}, ${data.city}, ${data.province} (${data.postalCode})`,
    '', 'Quedo a la espera del costo de envío y los pasos para terminar la compra.',
  ].join('\n');
}

export function useCheckoutSubmit({ items, couponCode, salesLinkToken, clearCart, whatsapp }: Params) {
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
          carrier: 'correo_argentino',
        },
        couponCode: couponCode || undefined,
        salesLinkToken: salesLinkToken || undefined,
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
        salesLinkToken: salesLinkToken || undefined,
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
    if (data.shippingMethod !== 'correo_argentino') {
      const url = buildWhatsappUrl(whatsapp, shippingCoordinationMessage(data, items, couponCode));
      if (!url) {
        setOrderError('No hay un número de WhatsApp configurado para coordinar este envío. Elegí Correo Argentino o contactanos por email.');
        return;
      }
      window.location.href = url;
      return;
    }
    if (data.paymentMethod === 'transfer') {
      await submitTransfer(data);
      return;
    }
    await submitMercadoPago(data);
  };

  return { onSubmit, orderError, orderSuccess, orderNumber };
}
