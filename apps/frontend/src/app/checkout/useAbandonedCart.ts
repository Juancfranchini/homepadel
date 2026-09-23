'use client';

import { useEffect, useRef } from 'react';
import { CartItem } from '@/types';
import { saveAbandonedCart } from '@/lib/api';

/** Se espera a que deje de escribir antes de guardar, para no llamar en cada tecla. */
const ESPERA_MS = 2500;

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Datos {
  email?: string;
  name?: string;
  phone?: string;
}

/**
 * Registra el carrito de quien empezó el checkout y todavía no compró.
 *
 * Es lo que hacen Shopify y Tiendanube: en cuanto hay un email, el carrito
 * queda guardado, y si esa persona no termina la compra aparece en el panel
 * para poder recuperarla.
 *
 * Solo se manda qué productos y cuántos: el nombre y el precio los resuelve el
 * servidor contra la base. Si vinieran de acá, cualquiera podría llenar el
 * listado del backoffice con productos y montos inventados.
 */
export function useAbandonedCart(items: CartItem[], datos: Datos, yaCompro: boolean): void {
  const ultimoEnviado = useRef('');

  useEffect(() => {
    const email = datos.email?.trim().toLowerCase();
    if (yaCompro || !email || !EMAIL_VALIDO.test(email) || items.length === 0) return;

    const carrito = items.map((item) => ({
      productId: item.product.id,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    // Si nada cambió desde el último envío, no se vuelve a llamar.
    const huella = JSON.stringify({ email, name: datos.name, phone: datos.phone, carrito });
    if (huella === ultimoEnviado.current) return;

    const temporizador = setTimeout(() => {
      ultimoEnviado.current = huella;
      // Falla en silencio a propósito: esto es una ayuda para la tienda, no
      // puede entorpecer una compra en curso.
      saveAbandonedCart({ email, name: datos.name, phone: datos.phone, items: carrito }).catch(() => {});
    }, ESPERA_MS);

    return () => clearTimeout(temporizador);
  }, [items, datos.email, datos.name, datos.phone, yaCompro]);
}
