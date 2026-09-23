'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  /** Sangría del nivel: el segundo nivel se corre para que se lea la jerarquía. */
  level?: 1 | 2;
  children: React.ReactNode;
}

/**
 * Sección plegable del menú móvil.
 *
 * Se anida hasta dos niveles —Productos › Categorías › Paletas— para que se
 * pueda llegar a una categoría o una marca sin pasar por el catálogo completo,
 * que era el camino obligado hasta ahora.
 */
export default function MobileNavAccordion({ label, level = 1, children }: Props) {
  const [open, setOpen] = useState(false);

  const textoNivel = level === 1
    ? 'text-sm font-semibold uppercase tracking-wide text-[#C7C7C0]'
    : 'text-xs font-semibold uppercase tracking-wide text-[#8A8A85]';

  return (
    <div className={level === 2 ? 'pl-3' : ''}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={'flex w-full items-center justify-between py-3 transition-colors hover:text-[#F7F6F7] ' + textoNivel}
      >
        {label}
        <ChevronDown
          size={16}
          className={'flex-shrink-0 transition-transform duration-200 ' + (open ? 'rotate-180 text-[#B7D31A]' : '')}
        />
      </button>

      {open && <div className="flex flex-col border-l border-[#0D0F0F] pl-3">{children}</div>}
    </div>
  );
}
