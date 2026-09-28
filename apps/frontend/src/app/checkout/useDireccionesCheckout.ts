'use client';

import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { DireccionGuardada, getDirecciones } from '@/lib/api';
import { CheckoutFormData } from './checkoutSchema';

/** Direcciones guardadas en la cuenta, para completar el envío con un toque. */
export function useDireccionesCheckout(conSesion: boolean, setValue: UseFormSetValue<CheckoutFormData>) {
  const [direcciones, setDirecciones] = useState<DireccionGuardada[]>([]);

  useEffect(() => {
    if (!conSesion) return;
    getDirecciones().then(setDirecciones).catch(() => setDirecciones([]));
  }, [conSesion]);

  const usar = (d: DireccionGuardada, telefonoActual?: string) => {
    const opciones = { shouldValidate: true, shouldDirty: true };
    setValue('street', d.street, opciones);
    setValue('city', d.city, opciones);
    setValue('province', d.province, opciones);
    setValue('postalCode', d.postalCode, opciones);
    if (d.phone && !telefonoActual) setValue('phone', d.phone, opciones);
  };

  return { direcciones, usar };
}

export type DireccionesCheckout = ReturnType<typeof useDireccionesCheckout>;
