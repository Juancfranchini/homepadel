'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  /** Sangría del nivel: el segundo nivel se corre para que se lea la jerarquía. */
  level?: 1 | 2;
  active?: boolean;
  children: React.ReactNode;
}

/**
 * Sección plegable del menú móvil.
 *
 * Se anida hasta dos niveles —Productos › Categorías › Paletas— para que se
 * pueda llegar a una categoría o una marca sin pasar por el catálogo completo,
 * que era el camino obligado hasta ahora.
 */
export default function MobileNavAccordion({ label, level = 1, active = false, children }: Props) {
  const [open, setOpen] = useState(active);

  const textoNivel = level === 1
    ? 'text-sm font-semibold uppercase tracking-wide'
    : 'text-xs font-semibold uppercase tracking-wide';
  const color = active ? 'bg-[#B7D31A]/10 text-[#D4EE43] ring-1 ring-[#B7D31A]/30' : 'text-[#C7C7C0]';

  return (
    <div className={level === 2 ? 'pl-3' : 'my-0.5'}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={'flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.06] hover:text-[#F7F6F7] ' + textoNivel + ' ' + color}
      >
        {label}
        <ChevronDown
          size={16}
          className={'flex-shrink-0 transition-transform duration-200 ' + (open ? 'rotate-180 text-[#B7D31A]' : '')}
        />
      </button>

      {open && <div className="ml-3 flex flex-col border-l border-[#343A3D] pl-3">{children}</div>}
    </div>
  );
}
