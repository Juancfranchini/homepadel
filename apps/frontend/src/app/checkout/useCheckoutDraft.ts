'use client';

import { useEffect } from 'react';
import { UseFormReset, UseFormWatch } from 'react-hook-form';
import { CheckoutFormData } from './checkoutSchema';

const CLAVE = 'homepadel-checkout';

/**
 * Guarda lo que se escribió en el checkout mientras dure la pestaña.
 *
 * Ir a Mercado Pago es una navegación completa fuera del sitio: al volver,
 * React monta el formulario de cero y todo lo cargado se había perdido. Lo
 * mismo pasaba al recargar por error.
 *
 * Se usa `sessionStorage` y no `localStorage` a propósito: son datos
 * personales (nombre, teléfono, domicilio) y así se borran solos al cerrar la
 * pestaña, sin quedar en el equipo de quien compró desde una máquina
 * compartida.
 */
export function limpiarBorrador(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Modo privado o almacenamiento bloqueado: no hay nada que limpiar.
  }
}

function leerBorrador(): Partial<CheckoutFormData> | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) return null;
    const datos = JSON.parse(crudo);
    return datos && typeof datos === 'object' ? datos : null;
  } catch {
    return null;
  }
}

export function useCheckoutDraft(watch: UseFormWatch<CheckoutFormData>, reset: UseFormReset<CheckoutFormData>, allowTransfer = false): void {
  useEffect(() => {
    const borrador = leerBorrador();
    // `keepDefaultValues` deja intactos el nombre y el email que vienen de la
    // sesión si el borrador no los trae.
    if (borrador) {
      const paymentMethod = allowTransfer && borrador.paymentMethod === 'transfer' ? 'transfer' : 'mercadopago';
      reset({ ...borrador, paymentMethod }, { keepDefaultValues: true });
    }
  }, [allowTransfer, reset]);

  useEffect(() => {
    const suscripcion = watch((valores) => {
      try {
        sessionStorage.setItem(CLAVE, JSON.stringify(valores));
      } catch {
        // Si el navegador no deja escribir, el checkout sigue funcionando:
        // lo único que se pierde es poder recuperar los datos al volver.
      }
    });
    return () => suscripcion.unsubscribe();
  }, [watch]);
}
