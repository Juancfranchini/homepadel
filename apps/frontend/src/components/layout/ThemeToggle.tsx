'use client';

import { Moon, Sun } from 'lucide-react';
import { aplicarTema, temaActual } from '@/lib/tema';

/**
 * Botón de luna/sol. En el tema oscuro muestra el sol (pasar a claro) y en el
 * claro la luna (volver a oscuro). Qué ícono se ve lo decide el CSS según
 * data-theme, no el estado de React: así el HTML del servidor ya sale bien y
 * no hay parpadeo ni diferencias de hidratación.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const alternar = () => aplicarTema(temaActual() === 'light' ? 'dark' : 'light');

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Cambiar entre tema claro y oscuro"
      title="Cambiar entre tema claro y oscuro"
      className={'flex h-9 w-9 items-center justify-center rounded-full text-fg-soft transition-colors hover:bg-chip hover:text-fg ' + className}
    >
      <Sun size={19} className="light:hidden" aria-hidden="true" />
      <Moon size={18} className="hidden light:block" aria-hidden="true" />
    </button>
  );
}
