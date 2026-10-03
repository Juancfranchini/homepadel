'use client';

import { useEffect } from 'react';
import { guardarContacto } from '@/lib/contactoComprador';

/** Se espera a que deje de escribir: no se guarda un mail a medias en cada tecla. */
const ESPERA_MS = 1500;

/**
 * Guarda el mail y el teléfono apenas se escriben en el checkout, para que
 * los eventos de Meta que siguen los lleven (cifrados en el servidor). Ver
 * lib/contactoComprador.ts.
 */
export function useContactoParaMeta(email?: string, telefono?: string): void {
  useEffect(() => {
    if (!email && !telefono) return;
    const temporizador = setTimeout(() => guardarContacto(email, telefono), ESPERA_MS);
    return () => clearTimeout(temporizador);
  }, [email, telefono]);
}
