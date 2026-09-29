'use client';

import { useEffect, useState } from 'react';
import { modoPruebaActivo, salirDeModoPrueba } from '@/lib/modoPrueba';
import { codigoDePruebaMeta } from '@/lib/metaNavegador';

type Modo = { tipo: 'prueba' } | { tipo: 'meta'; codigo: string } | null;

/**
 * Aviso fijo mientras el navegador está en un modo de prueba: sin él, es
 * fácil olvidarse de que no está midiendo como un cliente. Solo lo ve quien
 * lo activó; a un cliente nunca le aparece.
 *  - Modo prueba (lib/modoPrueba.ts): no se registra ni se manda nada.
 *  - Probar eventos de Meta (`?meta_test=CODIGO`): todo va a "Probar
 *    eventos" y los pedidos quedan marcados como prueba.
 */
export default function ModoPruebaAviso() {
  // Se lee después de montar: el servidor no sabe qué hay en el navegador.
  const [modo, setModo] = useState<Modo>(null);
  useEffect(() => {
    const codigo = codigoDePruebaMeta();
    setModo(modoPruebaActivo() ? { tipo: 'prueba' } : codigo ? { tipo: 'meta', codigo } : null);
  }, []);

  if (!modo) return null;

  const salir = () => {
    if (modo.tipo === 'prueba') {
      salirDeModoPrueba();
      window.location.assign(window.location.pathname);
    } else {
      window.location.assign(window.location.pathname + '?meta_test=0');
    }
  };

  return (
    <div
      role="status"
      className="fixed bottom-5 left-5 z-40 flex max-w-[calc(100vw-7rem)] items-center gap-3 rounded-full border border-amber-400/40 bg-chip px-4 py-2 text-xs text-amber-300 light:text-amber-700 shadow-lg shadow-black/40 sm:bottom-6 sm:left-6"
    >
      <span className="font-bold uppercase tracking-wide">{modo.tipo === 'prueba' ? 'Modo prueba' : 'Prueba de Meta'}</span>
      <span className="hidden text-fg-soft sm:inline">
        {modo.tipo === 'prueba' ? 'No se registra ni se manda a Meta' : `Va a "Probar eventos" (${modo.codigo})`}
      </span>
      <button type="button" onClick={salir} className="font-semibold text-fg underline underline-offset-2 hover:text-amber-200 light:hover:text-amber-800">
        Salir
      </button>
    </div>
  );
}
