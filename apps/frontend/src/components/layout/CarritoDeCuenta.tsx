'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { saveAbandonedCart } from '@/lib/api';
import { modoPruebaActivo } from '@/lib/modoPrueba';

/** Se espera a que termine de armar el carrito antes de guardar. */
const ESPERA_MS = 3000;

/**
 * Guarda el carrito de un cliente con sesión iniciada apenas agrega algo.
 *
 * El registro de carritos abandonados solo se enteraba de quien llegaba al
 * checkout y escribía su mail: los que agregaban al carrito y se iban eran
 * anónimos. Con la sesión iniciada el mail ya se conoce (es el de su
 * cuenta), así que ese carrito también aparece en el backoffice para
 * contactarlo. Sin sesión no se guarda nada: no hay a quién atribuirlo.
 *
 * Solo clientes: el personal de la tienda navegando no es un abandono.
 */
export default function CarritoDeCuenta() {
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const ultimoEnviado = useRef('');

  useEffect(() => {
    if (!user?.email || user.role !== 'CUSTOMER' || items.length === 0 || modoPruebaActivo()) return;

    const carrito = items.map((item) => ({ productId: item.product.id, variantId: item.variantId, quantity: item.quantity }));
    const huella = JSON.stringify({ email: user.email, carrito });
    if (huella === ultimoEnviado.current) return;

    const temporizador = setTimeout(() => {
      ultimoEnviado.current = huella;
      // Falla en silencio: es una ayuda para la tienda, no puede molestar al cliente.
      saveAbandonedCart({
        email: user.email,
        name: user.name || undefined,
        phone: user.phone || undefined,
        items: carrito,
      }).catch(() => {});
    }, ESPERA_MS);

    return () => clearTimeout(temporizador);
  }, [items, user]);

  return null;
}
