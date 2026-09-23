'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SPEC_ICONS, specIcon } from './specIcons';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Selector de icono para una especificación.
 *
 * Reemplaza al `<select>` nativo, que solo podía listar los nombres: había que
 * elegir a ciegas y recién al guardar se veía qué dibujo había salido. Acá la
 * lista muestra el icono junto a su nombre.
 *
 * El icono elegido se dibuja en gris oscuro. Antes iba en el verde de la marca
 * (#C8FF00) sobre fondo blanco, que prácticamente no se distingue.
 */
export default function SpecIconPicker({ value, onChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const actual = SPEC_ICONS.find((o) => o.value === value);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', escape); };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="w-full flex items-center gap-2 px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40"
      >
        <span className="text-gray-700 flex-shrink-0">{createElement(specIcon(value), { size: 15 })}</span>
        <span className="truncate flex-1 text-left">{actual?.label || 'Elegir icono'}</span>
        <ChevronDown size={13} className={'flex-shrink-0 text-gray-400 transition-transform ' + (abierto ? 'rotate-180' : '')} />
      </button>

      {abierto && (
        <div className="absolute z-30 mt-1 max-h-64 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
          {SPEC_ICONS.map((opcion) => (
            <button
              key={opcion.value}
              type="button"
              onClick={() => { onChange(opcion.value); setAbierto(false); }}
              className={
                'flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-gray-50 ' +
                (opcion.value === value ? 'bg-[#C8FF00]/15 font-semibold text-gray-900' : 'text-gray-600')
              }
            >
              <span className="text-gray-700 flex-shrink-0">{createElement(opcion.icon, { size: 15 })}</span>
              {opcion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
