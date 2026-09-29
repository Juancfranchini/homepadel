'use client';

import { useEffect } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useEnvioFlex } from '@/hooks/useEnvioFlex';
import { buscarZonaFlex, provinciaDeLocalidadFlex } from '@/lib/envioFlex';
import { CheckoutFormData } from './checkoutSchema';

/**
 * Relaciona el Envío Flex con la ubicación del cliente: ubica su localidad en
 * una zona para mostrar el precio, completa la provincia y deja la localidad
 * escrita con el nombre del tarifario (el que usa el servidor para cobrar).
 */
export function useCheckoutFlex(watch: UseFormWatch<CheckoutFormData>, setValue: UseFormSetValue<CheckoutFormData>) {
  const info = useEnvioFlex();
  const metodo = watch('shippingMethod');
  const ciudad = watch('city');
  const zona = buscarZonaFlex(info, ciudad);
  const esFlex = metodo === 'flex';

  useEffect(() => {
    if (!esFlex || !zona) return;
    if (ciudad !== zona.localidad) setValue('city', zona.localidad);
    setValue('province', provinciaDeLocalidadFlex(zona.localidad));
  }, [esFlex, zona, ciudad, setValue]);

  // Si Flex se apaga mientras alguien lo tenía elegido, vuelve a Correo.
  useEffect(() => {
    if (esFlex && info.zonas.length > 0 && !info.activo) setValue('shippingMethod', 'correo_argentino');
  }, [esFlex, info, setValue]);

  const elegirMetodo = (valor: CheckoutFormData['shippingMethod']) => setValue('shippingMethod', valor, { shouldValidate: false });
  const usarFlex = () => elegirMetodo('flex');

  return { info, zona, esFlex, usarFlex, elegirMetodo };
}

export type CheckoutFlex = ReturnType<typeof useCheckoutFlex>;
