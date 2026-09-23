import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  /** Filtro aplicado hoy. Se muestra debajo de la etiqueta cuando existe. */
  value?: string;
  active?: boolean;
  /** Presente solo en los controles que despliegan contenido debajo. */
  expanded?: boolean;
  /** Para controles de dos estados, como Ofertas. */
  pressed?: boolean;
  onClick: () => void;
}

/**
 * Control de la barra lateral del catálogo.
 *
 * Antes la barra era solo íconos: había que abrir cada panel para descubrir qué
 * hacía, y algunos no se entendían de ningún modo —una diana para "Ofertas"—.
 * Acá cada control lleva su nombre y, si hay un filtro puesto, lo muestra
 * debajo. La etiqueta resuelve el "qué hace esto"; el valor, el "qué tengo
 * aplicado", que antes obligaba a abrir los cuatro paneles para averiguarlo.
 */
export default function CatalogSidebarButton({ icon: Icon, label, value, active, expanded, onClick, pressed }: Props) {
  return (
    <button
      onClick={onClick}
      aria-pressed={pressed}
      aria-expanded={expanded}
      className={
        'flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ' +
        (active
          ? 'border border-[#B7D31A]/30 bg-[#B7D31A]/10 text-[#B7D31A]'
          : 'border border-transparent text-[#8A8A85] hover:bg-[#0C0C0C] hover:text-[#F7F6F7]')
      }
    >
      <Icon size={17} className="mt-0.5 flex-shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold leading-tight">{label}</span>
        {value && (
          <span className="truncate text-[10px] leading-tight text-[#C7C7C0]" title={value}>
            {value}
          </span>
        )}
      </span>
      {expanded !== undefined && (
        <ChevronDown
          size={14}
          className={'mt-0.5 flex-shrink-0 transition-transform duration-200 ' + (expanded ? 'rotate-180' : '')}
        />
      )}
    </button>
  );
}
