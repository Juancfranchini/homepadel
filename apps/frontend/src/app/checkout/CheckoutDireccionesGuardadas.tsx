'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { DireccionGuardada } from '@/lib/api';

interface Props {
  direcciones: DireccionGuardada[];
  onUsar: (d: DireccionGuardada) => void;
}

/** Botones con las direcciones de la cuenta: tocar una completa el domicilio. */
export default function CheckoutDireccionesGuardadas({ direcciones, onUsar }: Props) {
  if (direcciones.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Tus direcciones</p>
      <div className="flex flex-wrap gap-2">
        {direcciones.map((d) => (
          <button key={d.id} type="button" onClick={() => onUsar(d)} className="flex items-center gap-2 rounded-lg border border-chip px-3 py-2 text-left text-xs text-fg-soft hover:border-[#B7D31A]/50 hover:text-fg transition-colors">
            <MapPin size={13} className="text-brand-fg flex-shrink-0" />
            <span><strong className="text-fg">{d.label || d.street}</strong>{d.label ? ` · ${d.street}` : ''}, {d.city}</span>
          </button>
        ))}
      </div>
      <Link href="/cuenta" className="inline-block mt-2 text-[11px] text-fg-muted hover:text-fg">Administrar direcciones en Mi cuenta</Link>
    </div>
  );
}
