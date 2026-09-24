'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/** Se pide una sola vez por visita: son tres URLs que no cambian mientras navega. */
let cache: Record<string, string> | null = null;
let pedido: Promise<Record<string, string>> | null = null;

async function traer(): Promise<Record<string, string>> {
  if (cache) return cache;
  if (!pedido) {
    pedido = fetch(API_URL + '/site-sections/formatos_paleta')
      .then((r) => r.json())
      .then((res) => {
        const datos = (res?.data ?? res ?? {}) as Record<string, unknown>;
        const limpio: Record<string, string> = {};
        for (const [formato, url] of Object.entries(datos)) {
          if (typeof url === 'string' && url.trim()) limpio[formato] = url.trim();
        }
        cache = limpio;
        return limpio;
      })
      .catch(() => ({}));
  }
  return pedido;
}

/**
 * Imagen configurada para cada formato de paleta.
 *
 * Devuelve un objeto vacío mientras carga y si no hay nada configurado: quien
 * lo use tiene que poder dibujarse sin imagen.
 */
export function useShapeImages(): Record<string, string> {
  const [imagenes, setImagenes] = useState<Record<string, string>>(cache ?? {});

  useEffect(() => {
    let vigente = true;
    traer().then((datos) => { if (vigente) setImagenes(datos); });
    return () => { vigente = false; };
  }, []);

  return imagenes;
}
