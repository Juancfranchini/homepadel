'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Tag, SlidersHorizontal, ArrowDownUp, Percent, Grid3x3, Rows3 } from 'lucide-react';
import { Category, Brand } from '@/types';
import { sortLabel } from '../sortOptions';
import CatalogSidebarPanel, { ActivePanel, PanelProps } from './CatalogSidebarPanel';
import CatalogSidebarButton from './CatalogSidebarButton';
import CatalogSidebarSection from './CatalogSidebarSection';

type Seccion = Exclude<ActivePanel, null>;

interface Props extends PanelProps {
  categories: Category[];
  brands: Brand[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function CatalogSidebar(props: Props) {
  const {
    viewMode, onViewModeChange, categories, brands, hasFilters, onClear,
    selectedCategory, selectedBrand, selectedShape, selectedSize, selectedColor, selectedWeight, selectedGender,
    isOffer, onOfferChange, currentSort,
  } = props;

  // Varias secciones pueden estar abiertas a la vez. Combinar categoría y
  // marca —"paletas" de "Babolat"— es el caso corriente, y con una sola
  // abierta había que cerrar una para poder llegar a la otra.
  const [abiertas, setAbiertas] = useState<Seccion[]>([]);
  const alternar = (s: Seccion) =>
    setAbiertas((actuales) => (actuales.includes(s) ? actuales.filter((x) => x !== s) : [...actuales, s]));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbiertas([]); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // El valor vigente se muestra debajo de cada control: así se entiende qué
  // hace el botón y, a la vez, qué filtro está aplicado sin tener que abrirlo.
  const nombreCategoria = categories.find((c) => c.slug === selectedCategory)?.name;
  const nombreMarca = brands.find((b) => b.slug === selectedBrand)?.name.trim();
  const atributos = [selectedGender, selectedShape, selectedSize, selectedColor, selectedWeight].filter(Boolean);

  const seccion = (clave: Seccion, icon: typeof Tag, label: string, value?: string) => (
    <CatalogSidebarSection
      icon={icon} label={label} value={value}
      open={abiertas.includes(clave)} onToggle={() => alternar(clave)}
    >
      <CatalogSidebarPanel {...props} activePanel={clave} />
    </CatalogSidebarSection>
  );

  return (
    <div className="flex w-56 flex-col gap-1 py-2">
      {seccion('categories', LayoutGrid, 'Categoría', nombreCategoria)}
      {seccion('brands', Tag, 'Marca', nombreMarca)}
      {seccion('attributes', SlidersHorizontal, 'Atributos', atributos.length > 0 ? atributos.join(' · ') : undefined)}
      {seccion('sort', ArrowDownUp, 'Ordenar', sortLabel(currentSort))}

      {/* Ofertas es un sí/no: abrir una sección para marcar una sola casilla
          obligaba a dos clics para algo que se resuelve con uno. */}
      <CatalogSidebarButton
        icon={Percent} label="Ofertas" value={isOffer ? 'Solo ofertas' : undefined}
        active={isOffer} onClick={() => onOfferChange(!isOffer)} pressed={isOffer}
      />

      <div className="my-2 h-px w-full bg-[#0D0F0F]" />

      <CatalogSidebarButton
        icon={viewMode === 'grid' ? Rows3 : Grid3x3}
        label={viewMode === 'grid' ? 'Ver en lista' : 'Ver en grilla'}
        onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
      />

      {/* Antes vivía dentro del panel flotante: solo aparecía con una sección
          abierta, así que para limpiar había que abrir cualquiera primero. */}
      {hasFilters && (
        <button onClick={onClear} className="mt-1 px-2.5 py-1 text-left text-xs font-medium text-red-400 transition-colors hover:text-red-300">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
