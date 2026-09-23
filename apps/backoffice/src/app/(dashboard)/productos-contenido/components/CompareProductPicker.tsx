'use client';

import { useState } from 'react';
import { Product } from '../useProductosContenido';

interface Props {
  value: string;
  catalogo: Product[];
  /** Se dispara al elegir del catálogo: trae el producto entero para copiar sus datos. */
  onPick: (producto: Product) => void;
  onNameChange: (name: string) => void;
}

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

const MANUAL = '__manual__';

/**
 * Elige contra qué producto se compara.
 *
 * Antes había que escribir el nombre a mano y cargar cada valor de nuevo,
 * aunque esa paleta ya estuviera en el catálogo con su rendimiento cargado.
 * Al elegirla de la lista se copian sus barras de rendimiento a las
 * características que coincidan por nombre.
 *
 * Queda la opción de escribirlo a mano para comparar contra algo que no se
 * vende en la tienda.
 */
export default function CompareProductPicker({ value, catalogo, onPick, onNameChange }: Props) {
  const enCatalogo = catalogo.some((p) => p.name === value);
  const [manual, setManual] = useState(!!value && !enCatalogo);

  const alElegir = (seleccion: string) => {
    if (seleccion === MANUAL) { setManual(true); onNameChange(''); return; }
    const producto = catalogo.find((p) => p.id === seleccion);
    if (producto) { setManual(false); onPick(producto); }
  };

  if (manual) {
    return (
      <div className="flex-1 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputClass}
          placeholder="Nombre del producto"
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setManual(false); onNameChange(''); }}
          className="text-[11px] whitespace-nowrap text-gray-500 underline hover:text-gray-700"
        >
          Elegir del catálogo
        </button>
      </div>
    );
  }

  return (
    <select
      value={catalogo.find((p) => p.name === value)?.id || ''}
      onChange={(e) => alElegir(e.target.value)}
      className={inputClass + ' flex-1'}
    >
      <option value="" disabled>Elegí un producto del catálogo</option>
      {catalogo.map((producto) => (
        <option key={producto.id} value={producto.id}>{producto.name}</option>
      ))}
      <option value={MANUAL}>— Escribir otro nombre a mano —</option>
    </select>
  );
}
