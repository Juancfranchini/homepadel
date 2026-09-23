'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Tag, SlidersHorizontal, ArrowDownUp, Percent, Grid3x3, Rows3 } from 'lucide-react';
import { Category, Brand } from '@/types';
import { sortLabel } from '../sortOptions';
import CatalogSidebarPanel, { ActivePanel, PanelProps } from './CatalogSidebarPanel';
import CatalogSidebarButton from './CatalogSidebarButton';

interface Props extends PanelProps {
  categories: Category[];
  brands: Brand[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function CatalogSidebar(props: Props) {
  const {
    viewMode, onViewModeChange, categories, brands,
    selectedCategory, selectedBrand, selectedShape, selectedSize, selectedColor, selectedWeight,
    isOffer, onOfferChange, currentSort,
  } = props;

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActivePanel(null); };
    if (activePanel) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activePanel]);

  const toggle = (panel: ActivePanel) => setActivePanel((current) => (current === panel ? null : panel));

  // El valor vigente se muestra debajo de cada control: así se entiende qué
  // hace el botón y, a la vez, qué filtro está aplicado sin tener que abrirlo.
  const nombreCategoria = categories.find((c) => c.slug === selectedCategory)?.name;
  const nombreMarca = brands.find((b) => b.slug === selectedBrand)?.name.trim();
  const atributos = [selectedShape, selectedSize, selectedColor, selectedWeight].filter(Boolean);

  return (
    <div className="flex items-start gap-0">
      <div className="flex w-[8.5rem] flex-col gap-1 py-2">
        <CatalogSidebarButton
          icon={LayoutGrid} label="Categoría" value={nombreCategoria}
          active={activePanel === 'categories'} onClick={() => toggle('categories')}
        />
        <CatalogSidebarButton
          icon={Tag} label="Marca" value={nombreMarca}
          active={activePanel === 'brands'} onClick={() => toggle('brands')}
        />
        <CatalogSidebarButton
          icon={SlidersHorizontal} label="Atributos"
          value={atributos.length > 0 ? atributos.join(' · ') : undefined}
          active={activePanel === 'attributes'} onClick={() => toggle('attributes')}
        />
        <CatalogSidebarButton
          icon={ArrowDownUp} label="Ordenar" value={sortLabel(currentSort)}
          active={activePanel === 'sort'} onClick={() => toggle('sort')}
        />

        {/* Ofertas es un sí/no: abrir un panel para marcar una sola casilla
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
      </div>

      <CatalogSidebarPanel {...props} activePanel={activePanel} onClose={() => setActivePanel(null)} />
    </div>
  );
}
