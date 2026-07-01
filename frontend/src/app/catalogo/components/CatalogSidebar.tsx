'use client';

import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Tags, Target, Grid3x3, Rows3, ArrowDownUp, ChevronLeft } from 'lucide-react';
import { Category, Brand } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Novedades' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
];

interface Props {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  totalCount: number;
  viewMode: 'grid' | 'list';
  currentSort: string;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (slug: string | null) => void;
  onBrandChange: (slug: string | null) => void;
  onOfferChange: (v: boolean) => void;
  onClear: () => void;
  hasFilters: boolean;
}

const MENU_ITEMS = [
  { id: 'categories', icon: SlidersHorizontal, label: 'Categorias' },
  { id: 'brands', icon: Tags, label: 'Marcas' },
  { id: 'offers', icon: Target, label: 'Ofertas' },
  { id: 'sort', icon: ArrowDownUp, label: 'Ordenar' },
];

type ActivePanel = 'categories' | 'brands' | 'offers' | 'sort' | null;

export default function CatalogSidebar({
  categories, brands, selectedCategory, selectedBrand, isOffer, totalCount,
  viewMode, currentSort, onViewModeChange, onSortChange,
  onCategoryChange, onBrandChange, onOfferChange, onClear, hasFilters,
}: Props) {
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

  const openPanel = (panel: ActivePanel) => {
    setActivePanel(panel);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  return (
    <div className="flex items-start gap-0">
      {/* Barra de iconos vertical */}
      <div className="flex flex-col items-center gap-1 py-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button key={item.id} onClick={() => openPanel(item.id as ActivePanel)}
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

      {/* Panel expandible - solo se muestra si activePanel no es null */}
      {activePanel && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div className="fixed inset-0 z-10" onClick={closePanel} />

          <div ref={sidebarRef} className="relative z-20 w-56 bg-[#0C0C0C] border border-[#0D0F0F] rounded-2xl p-4 ml-2 shadow-2xl animate-fade-in">
            {/* Boton para contraer */}
            <button onClick={closePanel}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-[#C7C7C0] hover:text-[#F7F6F7] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
              title="Cerrar panel">
              <ChevronLeft size={16} />
            </button>

            {activePanel === 'categories' && (
              <div>
                <h3 className="text-xs font-semibold text-[#F7F6F7] uppercase tracking-wider mb-3 pr-6">Categorias</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={'w-4 h-4 rounded border flex-none flex items-center justify-center transition-colors ' +
                        (selectedCategory === cat.slug ? 'bg-[#B7D31A] border-[#B7D31A]' : 'border-[#8A8A85] group-hover:border-[#F7F6F7]')}>
                        {selectedCategory === cat.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#050606" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        <input type="checkbox" checked={selectedCategory === cat.slug} onChange={() => onCategoryChange(selectedCategory === cat.slug ? null : cat.slug)} className="sr-only" />
                      </div>
                      <span className={'text-sm ' + (selectedCategory === cat.slug ? 'text-[#F7F6F7] font-semibold' : 'text-[#C7C7C0] group-hover:text-[#F7F6F7]') + ' transition-colors truncate'}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'brands' && (
              <div>
                <h3 className="text-xs font-semibold text-[#F7F6F7] uppercase tracking-wider mb-3 pr-6">Marcas</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={'w-4 h-4 rounded border flex-none flex items-center justify-center transition-colors ' +
                        (selectedBrand === brand.slug ? 'bg-[#B7D31A] border-[#B7D31A]' : 'border-[#8A8A85] group-hover:border-[#F7F6F7]')}>
                        {selectedBrand === brand.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#050606" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        <input type="checkbox" checked={selectedBrand === brand.slug} onChange={() => onBrandChange(selectedBrand === brand.slug ? null : brand.slug)} className="sr-only" />
                      </div>
                      <span className={'text-sm ' + (selectedBrand === brand.slug ? 'text-[#F7F6F7] font-semibold' : 'text-[#C7C7C0] group-hover:text-[#F7F6F7]') + ' transition-colors truncate'}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'offers' && (
              <div>
                <h3 className="text-xs font-semibold text-[#F7F6F7] uppercase tracking-wider mb-3 pr-6">Ofertas</h3>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={'w-4 h-4 rounded border flex items-center justify-center transition-colors ' +
                    (isOffer ? 'bg-[#B7D31A] border-[#B7D31A]' : 'border-[#8A8A85] group-hover:border-[#F7F6F7]')}>
                    {isOffer && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#050606" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    <input type="checkbox" checked={isOffer} onChange={() => onOfferChange(!isOffer)} className="sr-only" />
                  </div>
                  <span className={'text-sm ' + (isOffer ? 'text-[#B7D31A] font-semibold' : 'text-[#C7C7C0] group-hover:text-[#F7F6F7]') + ' transition-colors'}>Solo ofertas</span>
                </label>
              </div>
            )}

            {activePanel === 'sort' && (
              <div>
                <h3 className="text-xs font-semibold text-[#F7F6F7] uppercase tracking-wider mb-3 pr-6">Ordenar por</h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { onSortChange(opt.value); closePanel(); }}
                      className={'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ' +
                        (currentSort === opt.value ? 'text-[#B7D31A] bg-[#B7D31A]/5' : 'text-[#C7C7C0] hover:text-[#F7F6F7] hover:bg-white/[0.04]')}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasFilters && (
              <button onClick={onClear} className="mt-4 text-xs text-red-400 hover:text-red-300 font-medium">
                Limpiar filtros
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}