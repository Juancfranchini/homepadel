'use client';

import { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { SPEC_ICONS, specIcon } from './specIcons';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const ALTO_LISTA = 260;

/**
 * Selector de icono para una especificación.
 *
 * Reemplaza al `<select>` nativo, que solo podía listar los nombres: había que
 * elegir a ciegas y recién al guardar se veía qué dibujo había salido. Acá la
 * lista muestra el icono junto a su nombre.
 *
 * La lista se dibuja en un portal con posición fija. Colgada del propio
 * control quedaba recortada contra el borde del modal —se veían cinco
 * opciones de treinta y una— porque el cuerpo del modal recorta lo que se
 * desborda. Si no entra para abajo, se abre para arriba.
 *
 * El icono elegido va en gris oscuro: antes se dibujaba en el verde de la
 * marca (#C8FF00) sobre fondo blanco, donde prácticamente no se distingue.
 */
export default function SpecIconPicker({ value, onChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [caja, setCaja] = useState<{ top: number; left: number; width: number } | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const actual = SPEC_ICONS.find((o) => o.value === value);

  const ubicar = useCallback(() => {
    const r = boton.current?.getBoundingClientRect();
    if (!r) return;
    const espacioAbajo = window.innerHeight - r.bottom;
    const haciaArriba = espacioAbajo < ALTO_LISTA && r.top > espacioAbajo;
    setCaja({
      top: haciaArriba ? Math.max(8, r.top - ALTO_LISTA - 4) : r.bottom + 4,
      left: Math.min(r.left, window.innerWidth - 232),
      width: Math.max(r.width, 224),
    });
  }, []);

  useLayoutEffect(() => { if (abierto) ubicar(); }, [abierto, ubicar]);

  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!boton.current?.contains(t) && !lista.current?.contains(t)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    // Al estar en posición fija, la lista no acompaña el scroll del modal:
    // se cierra en vez de quedar flotando lejos del control.
    const cerrar = () => setAbierto(false);

    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', escape);
    window.addEventListener('scroll', cerrar, true);
    window.addEventListener('resize', cerrar);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('resize', cerrar);
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="w-full flex items-center gap-1.5 px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40"
      >
        <span className="text-gray-700 flex-shrink-0">{createElement(specIcon(value), { size: 15 })}</span>
        <span className="truncate flex-1 text-left" title={actual?.label}>{actual?.label || 'Elegir icono'}</span>
        <ChevronDown size={13} className={'flex-shrink-0 text-gray-400 transition-transform ' + (abierto ? 'rotate-180' : '')} />
      </button>

      {abierto && caja && createPortal(
        <div
          ref={lista}
          style={{ position: 'fixed', top: caja.top, left: caja.left, width: caja.width, maxHeight: ALTO_LISTA }}
          className="z-[100] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-2xl"
        >
          {SPEC_ICONS.map((opcion) => (
            <button
              key={opcion.value}
              type="button"
              onClick={() => { onChange(opcion.value); setAbierto(false); }}
              className={
                'flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-gray-50 ' +
                (opcion.value === value ? 'bg-[#C8FF00]/20 font-semibold text-gray-900' : 'text-gray-600')
              }
            >
              <span className="text-gray-700 flex-shrink-0">{createElement(opcion.icon, { size: 15 })}</span>
              {opcion.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
