'use client';

import { Brand } from '@/types';

interface Props {
  brands: Brand[];
  selectedBrand: string;
  onBrandChange: (slug: string | null) => void;
}

/**
 * Acceso directo por marca, arriba del listado.
 *
 * La marca ya se podía filtrar desde el panel lateral, pero ahí queda plegada
 * entre el resto de los filtros. Mucha gente llega buscando "una Nox" o "una
 * Bullpadel", y para esa persona la marca no es un filtro más: es el punto de
 * entrada. Por eso se muestra como una fila visible y no como una opción más.
 */
export default function CatalogBrandStrip({ brands, selectedBrand, onBrandChange }: Props) {
  if (brands.length === 0) return null;

  const base =
    'flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors';

  return (
    <nav aria-label="Marcas" className="mb-5 flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onBrandChange(null)}
        aria-pressed={!selectedBrand}
        className={
          base +
          (!selectedBrand
            ? ' border-[#B7D31A] bg-[#B7D31A] text-[#050606]'
            : ' border-[#1A1F21] bg-[#0C0C0C] text-[#C7C7C0] hover:border-[#B7D31A]/60 hover:text-[#F7F6F7]')
        }
      >
        Todas
      </button>

      {brands.map((brand) => {
        const active = selectedBrand === brand.slug;
        return (
          <button
            key={brand.id}
            onClick={() => onBrandChange(active ? null : brand.slug)}
            aria-pressed={active}
            className={
              base +
              (active
                ? ' border-[#B7D31A] bg-[#B7D31A] text-[#050606]'
                : ' border-[#1A1F21] bg-[#0C0C0C] text-[#C7C7C0] hover:border-[#B7D31A]/60 hover:text-[#F7F6F7]')
            }
          >
            {brand.name.trim()}
          </button>
        );
      })}
    </nav>
  );
}
