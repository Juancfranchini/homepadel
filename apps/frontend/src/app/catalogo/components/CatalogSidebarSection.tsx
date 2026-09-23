'use client';

import type { LucideIcon } from 'lucide-react';
import CatalogSidebarButton from './CatalogSidebarButton';

interface Props {
  icon: LucideIcon;
  label: string;
  /** Filtro aplicado hoy, para verlo sin abrir la sección. */
  value?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * Filtro plegable de la barra lateral.
 *
 * El contenido se abría en un panel flotante al costado, que corría la grilla
 * entera hacia la derecha: al tocar un filtro, los productos se movían de
 * lugar. Ahora se despliega debajo del control y dentro del ancho fijo de la
 * barra, así el listado se queda quieto.
 */
export default function CatalogSidebarSection({ icon, label, value, open, onToggle, children }: Props) {
  return (
    <div>
      <CatalogSidebarButton
        icon={icon} label={label} value={value}
        active={open} expanded={open} onClick={onToggle}
      />
      {open && (
        <div className="animate-fade-in mb-1 ml-3.5 border-l border-[#1A1F21] pb-1 pl-3 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
