'use client';

import { useEffect, useState } from 'react';

interface Props {
  minPrice: number | null;
  maxPrice: number | null;
  onChange: (min: number | null, max: number | null) => void;
}

const input = 'w-full rounded-lg border border-[#1A1F21] bg-[#161818] px-3 py-2 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:border-[#B7D31A]/60 focus:outline-none';

const aNumero = (texto: string): number | null => {
  const limpio = texto.replace(/\D/g, '');
  return limpio ? Number(limpio) : null;
};

/**
 * Rango de precio sobre lo que paga el cliente (con la oferta aplicada, igual
 * que el backend). Se aplica con el botón, no a cada tecla: si no, cada
 * número que se escribe dispararía una búsqueda.
 */
export default function CatalogPriceRange({ minPrice, maxPrice, onChange }: Props) {
  const [desde, setDesde] = useState(minPrice?.toString() ?? '');
  const [hasta, setHasta] = useState(maxPrice?.toString() ?? '');

  // Si el filtro cambia desde afuera (un chip que se quita, "limpiar filtros"), los campos acompañan.
  useEffect(() => { setDesde(minPrice?.toString() ?? ''); }, [minPrice]);
  useEffect(() => { setHasta(maxPrice?.toString() ?? ''); }, [maxPrice]);

  const aplicar = (e: React.FormEvent) => {
    e.preventDefault();
    let min = aNumero(desde);
    let max = aNumero(hasta);
    if (min != null && max != null && min > max) [min, max] = [max, min];
    onChange(min, max);
  };

  const hayFiltro = minPrice != null || maxPrice != null;

  return (
    <form onSubmit={aplicar} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[11px] text-[#8A8A85]">
          Desde
          <input value={desde} onChange={(e) => setDesde(e.target.value)} inputMode="numeric" placeholder="$ mín." className={input + ' mt-1'} aria-label="Precio mínimo" />
        </label>
        <label className="text-[11px] text-[#8A8A85]">
          Hasta
          <input value={hasta} onChange={(e) => setHasta(e.target.value)} inputMode="numeric" placeholder="$ máx." className={input + ' mt-1'} aria-label="Precio máximo" />
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-[#B7D31A] py-2 text-xs font-bold uppercase tracking-wide text-[#050606] transition-colors hover:bg-[#CAE52E]">
          Aplicar
        </button>
        {hayFiltro && (
          <button type="button" onClick={() => onChange(null, null)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#C7C7C0] transition-colors hover:text-[#F7F6F7]">
            Quitar
          </button>
        )}
      </div>
    </form>
  );
}
