'use client';

import { useEffect, useState } from 'react';
import { modoPruebaActivo, salirDeModoPrueba } from '@/lib/modoPrueba';

/**
 * Aviso fijo mientras el modo prueba está activo (ver lib/modoPrueba.ts):
 * sin él, es fácil olvidarse de que este navegador no está midiendo nada.
 * Solo lo ve quien lo activó; a un cliente nunca le aparece.
 */
export default function ModoPruebaAviso() {
  // Se lee después de montar: el servidor no sabe qué hay en el navegador.
  const [activo, setActivo] = useState(false);
  useEffect(() => setActivo(modoPruebaActivo()), []);

  if (!activo) return null;

  const salir = () => {
    salirDeModoPrueba();
    window.location.assign(window.location.pathname);
  };

  return (
    <div
      role="status"
      className="fixed bottom-5 left-5 z-40 flex max-w-[calc(100vw-7rem)] items-center gap-3 rounded-full border border-amber-400/40 bg-[#1A1F21] px-4 py-2 text-xs text-amber-300 shadow-lg shadow-black/40 sm:bottom-6 sm:left-6"
    >
      <span className="font-bold uppercase tracking-wide">Modo prueba</span>
      <span className="hidden text-[#C7C7C0] sm:inline">No se registra ni se manda a Meta</span>
      <button type="button" onClick={salir} className="font-semibold text-[#F7F6F7] underline underline-offset-2 hover:text-amber-200">
        Salir
      </button>
    </div>
  );
}
