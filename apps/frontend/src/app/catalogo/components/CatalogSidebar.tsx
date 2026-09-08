'use client';

import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Tags, Target, Grid3x3, Rows3, ArrowDownUp } from 'lucide-react';
import { Category, Brand } from '@/types';
import CatalogSidebarPanel from './CatalogSidebarPanel';

interface Props {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  viewMode: 'grid' | 'list';
  currentSort: string;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (slug: string | null) => void;
  onBrandChange: (slug: string | null) => void;
  onOfferChange: (v: boolean) => void;
  onClear: () => void;
  hasFilters: boolean;
  sizes: string[];
  colors: string[];
  weights: string[];
  selectedSize: string;
  selectedColor: string;
  selectedWeight: string;
  onSizeChange: (value: string | null) => void;
  onColorChange: (value: string | null) => void;
  onWeightChange: (value: string | null) => void;
}

const MENU_ITEMS = [
  { id: 'categories', icon: SlidersHorizontal, label: 'Categorías' },
  { id: 'brands', icon: Tags, label: 'Marcas' },
  { id: 'offers', icon: Target, label: 'Ofertas' },
  { id: 'sort', icon: ArrowDownUp, label: 'Ordenar' },
];

type ActivePanel = 'categories' | 'brands' | 'offers' | 'sort' | null;

export default function CatalogSidebar(props: Props) {
  const { viewMode, onViewModeChange } = props;
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePanel(null);
    };
    if (activePanel) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activePanel]);

  return (
    <div className="flex items-start gap-0">
      {/* Barra de iconos vertical */}
      <div className="flex flex-col items-center gap-1 py-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button key={item.id} onClick={() => setActivePanel(item.id as ActivePanel)}
              className={'w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-30 ' +
                (isActive ? 'bg-[#B7D31A]/10 text-[#B7D31A] border border-[#B7D31A]/30' : 'text-[#8A8A85] hover:text-[#F7F6F7] hover:bg-[#0C0C0C]')}
              title={item.label}>
              <Icon size={20} />
            </button>
          );
        })}

        <div className="w-6 h-px bg-[#0D0F0F] my-2" />

        {/* Vista Grid/List */}
        <button onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8A8A85] hover:text-[#F7F6F7] hover:bg-[#0C0C0C] transition-colors"
          title={viewMode === 'grid' ? 'Vista lista' : 'Vista grilla'}>
          {viewMode === 'grid' ? <Rows3 size={20} /> : <Grid3x3 size={20} />}
        </button>
      </div>

      <div ref={sidebarRef}>
        <CatalogSidebarPanel {...props} activePanel={activePanel} onClose={() => setActivePanel(null)} />
      </div>
    </div>
  );
}
