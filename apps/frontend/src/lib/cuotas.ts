'use client';

import { useEffect, useState } from 'react';

/**
 * Cuotas sin interés con Mercado Pago según el monto (Configuración → Cuotas
 * en el backoffice). Misma regla que el servidor (apps/backend/src/payments/cuotas.ts),
 * que es el que le pone el tope a Mercado Pago: la ficha, el carrito y el
 * checkout muestran exactamente lo que después se ofrece al pagar.
 */

export interface TramoCuotas {
  desde: number;
  cuotas: number;
}

export interface ConfigCuotas {
  activo: boolean;
  tramos: TramoCuotas[];
  cuotasBase: number;
}

const INACTIVO: ConfigCuotas = { activo: false, tramos: [], cuotasBase: 1 };

function configCuotas(guardado: unknown): ConfigCuotas {
  const g = (guardado ?? {}) as { activo?: unknown; tramos?: unknown; cuotasBase?: unknown };
  const tramos = (Array.isArray(g.tramos) ? g.tramos : [])
    .map((t) => ({ desde: Number((t as TramoCuotas)?.desde), cuotas: Math.floor(Number((t as TramoCuotas)?.cuotas)) }))
    .filter((t) => Number.isFinite(t.desde) && t.desde >= 0 && t.cuotas >= 1 && t.cuotas <= 24)
    .sort((a, b) => a.desde - b.desde);
  const base = Math.floor(Number(g.cuotasBase));
  return { activo: g.activo === true, tramos, cuotasBase: base >= 1 && base <= 24 ? base : 1 };
}

/** Máximo de cuotas para ese monto: el tramo más alto alcanzado, o las cuotas base. */
export function cuotasPara(monto: number, config: ConfigCuotas): number {
  let cuotas = config.cuotasBase;
  for (const tramo of config.tramos) if (monto >= tramo.desde) cuotas = tramo.cuotas;
  return cuotas;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
// Un solo pedido por carga de página: lo usan todas las tarjetas.
let pedido: Promise<ConfigCuotas> | null = null;
function cargar(): Promise<ConfigCuotas> {
  pedido ??= fetch(API_URL + '/site-sections/cuotas')
    .then((r) => r.json())
    .then((res: { data?: unknown }) => configCuotas(res?.data ?? res))
    .catch(() => {
      pedido = null;
      return INACTIVO;
    });
  return pedido;
}

/** Configuración de cuotas por monto; inactiva mientras carga o si no se activó. */
export function useConfigCuotas(): ConfigCuotas {
  const [config, setConfig] = useState<ConfigCuotas>(INACTIVO);
  useEffect(() => {
    let vigente = true;
    cargar().then((c) => { if (vigente) setConfig(c); });
    return () => { vigente = false; };
  }, []);
  return config;
}
