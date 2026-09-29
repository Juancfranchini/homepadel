'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
import { createOrder, createPaymentPreference } from '@/lib/api';
import { buildWhatsappUrl } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/utils';
import { idsDeMeta } from '@/lib/metaNavegador';
import { CheckoutFormData } from './checkoutSchema';

export interface DatosTransferencia {
  alias: string | null;
  cbu: string | null;
  titular: string | null;
  banco: string | null;
}

/** Lo que devuelve el servidor al tomar un pedido por transferencia. */
export interface PedidoTransferencia {
  total: number;
  datos: DatosTransferencia | null;
}

/**
 * El backend valida con class-validator, que devuelve un array de mensajes
 * cuando falla más de un campo. Mostrarlo tal cual dejaba "[object Object]".
 */
function mensajeDeError(err: unknown, porDefecto: string): string {
  const detalle = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(detalle)) return detalle.join('. ');
  return typeof detalle === 'string' ? detalle : porDefecto;
}

/**
 * Manda el pedido con las cookies del Pixel y, si se están probando eventos,
 * el código de prueba de Meta (`meta`). El servidor los guarda para informar
 * la compra a Meta cuando se confirme el pago.
 *
 * Un backend todavía sin actualizar puede rechazar `meta` o alguno de sus
 * campos ("... should not exist"). Durante ese rato del despliegue se
 * reintenta sin él, para no frenar ninguna compra por esto.
 */
async function conCookiesDelPixel<T>(enviar: (extra: { meta?: ReturnType<typeof idsDeMeta> }) => Promise<T>): Promise<T> {
  const meta = idsDeMeta();
  if (Object.keys(meta).length === 0) return enviar({});
  try {
    return await enviar({ meta });
  } catch (err) {
    const detalle = JSON.stringify((err as { response?: { data?: unknown } })?.response?.data ?? '');
    if (/(property meta|meta\.property \w+) should not exist/.test(detalle)) return enviar({});
    throw err;
  }
}

interface Params {
  items: CartItem[];
  couponCode: string | null;
  salesLinkToken: string | null;
  clearCart: () => void;
  whatsapp?: string;
  /** Bolsas de regalo que van (ya limitadas a las unidades del carrito). */
  bolsasRegalo: number;
}

function buildOrderItems(items: CartItem[]) {
  return items.map((i) => ({
    productId: i.product.id,
    name: i.product.name,
    quantity: i.quantity,
    variantId: i.variantId,
    variantSku: i.variantSku,
    variantSize: i.variantSize,
    variantColor: i.variantColor,
    variantDimensions: i.variantDimensions,
  }));
}

/** Con retiro en el local no hace falta domicilio, solo un teléfono de contacto. */
function buildShippingPayload(data: CheckoutFormData) {
  if (data.shippingMethod === 'retiro_local') {
    return { phone: data.phone, carrier: 'retiro_local' as const };
  }
  return {
    street: data.street,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    phone: data.phone,
    carrier: data.shippingMethod === 'flex' ? ('flex' as const) : ('correo_argentino' as const),
  };
}

function shippingCoordinationMessage(data: CheckoutFormData, items: CartItem[], couponCode: string | null, bolsasRegalo: number): string {
  const carrier = data.shippingMethod === 'andreani' ? 'Andreani' : 'OCA';
  const itemLines = items.map((item) => {
    const variant = [item.variantSize, item.variantColor, item.variantDimensions].filter(Boolean).join(' / ');
    return `- ${item.quantity} x ${item.product.name}${variant ? ` (${variant})` : ''}`;
  });
  const subtotal = items.reduce((sum, item) => sum + item.product.effectivePrice * item.quantity, 0);
  return [
    `Hola, quiero coordinar el envío por ${carrier}.`, '', 'Detalle del pedido:', ...itemLines,
    `Subtotal de productos: ${formatPrice(subtotal)}`,
    ...(couponCode ? [`Cupón aplicado: ${couponCode}`] : []),
    ...(bolsasRegalo > 0 ? [`Bolsas de regalo: ${bolsasRegalo}`] : []), '',
    `Cliente: ${data.name}`, `Email: ${data.email}`, `Teléfono: ${data.phone}`,
    `Entrega: ${data.street}, ${data.city}, ${data.province} (${data.postalCode})`,
    '', 'Quedo a la espera del costo de envío y los pasos para terminar la compra.',
  ].join('\n');
}

export function useCheckoutSubmit({ items, couponCode, salesLinkToken, clearCart, whatsapp, bolsasRegalo }: Params) {
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [pedidoTransferencia, setPedidoTransferencia] = useState<PedidoTransferencia | null>(null);

  // El domicilio y el teléfono viajan con la preferencia: el aviso de pago de
  // Mercado Pago no los trae, así que si no se mandan acá la venta se
  // registra sin dirección a la que enviar. El número de orden lo genera el
  // servidor.
  const submitMercadoPago = async (data: CheckoutFormData) => {
    try {
      const pref = await conCookiesDelPixel((extra) => createPaymentPreference({
        ...extra,
        items: buildOrderItems(items),
        payer: { name: data.name, email: data.email },
        shipping: buildShippingPayload(data),
        couponCode: couponCode || undefined,
        salesLinkToken: salesLinkToken || undefined,
        bolsasRegalo: bolsasRegalo || undefined,
      }));
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
      const esRetiro = data.shippingMethod === 'retiro_local';
      const result = await conCookiesDelPixel((extra) => createOrder({
        ...extra,
        paymentMethod: 'transfer',
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, variantId: item.variantId })),
        address: esRetiro ? 'Retiro en el local' : data.street + ', ' + data.city + ', ' + data.province + ' (' + data.postalCode + ')',
        buyerEmail: data.email,
        buyerPhone: data.phone,
        buyerName: data.name,
        couponCode: couponCode || undefined,
        salesLinkToken: salesLinkToken || undefined,
        carrier: esRetiro ? 'retiro_local' : data.shippingMethod === 'flex' ? 'flex' : 'correo_argentino',
        city: esRetiro ? undefined : data.city,
        bolsasRegalo: bolsasRegalo || undefined,
      }));
      setOrderNumber(result.number);
      setPedidoTransferencia({ total: Number(result.total) || 0, datos: result.datosTransferencia ?? null });
      clearCart();
      setOrderSuccess(true);
    } catch (err) {
      setOrderError(mensajeDeError(err, 'No pudimos registrar el pedido por transferencia. Probá de nuevo.'));
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setOrderError('');
    const coordinaPorWhatsapp = data.shippingMethod === 'andreani' || data.shippingMethod === 'oca';
    if (coordinaPorWhatsapp) {
      const url = buildWhatsappUrl(whatsapp, shippingCoordinationMessage(data, items, couponCode, bolsasRegalo));
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

  return { onSubmit, orderError, orderSuccess, orderNumber, pedidoTransferencia };
}
