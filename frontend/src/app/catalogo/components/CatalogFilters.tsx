import { SlidersHorizontal, X } from 'lucide-react';
import { Category, Brand } from '@/types';

interface Props {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  onCategoryChange: (slug: string | null) => void;
  onBrandChange: (slug: string | null) => void;
  onOfferChange: (v: boolean) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export default function CatalogFilters({
  categories, brands, selectedCategory, selectedBrand, isOffer,
  onCategoryChange, onBrandChange, onOfferChange, onClear, hasFilters,
}: Props) {
  return (
    <div className="bg-[#050606] border border-[#0D0F0F] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[#F7F6F7] font-semibold text-xs uppercase tracking-widest flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[#B7D31A]" />Filtros
        </h2>
        {hasFilters && (
          <button onClick={onClear} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold">
            <X size={11} />Limpiar
          </button>
        )}
      </div>

      

      <div className="mb-5 pb-5 border-b border-[#0D0F0F]">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className={'w-4 h-4 rounded border flex items-center justify-center transition-colors ' + (isOffer ? 'bg-[#B7D31A] border-[#B7D31A]' : 'border-[#0D0F0F] group-hover:border-[#8A8A85]')}>
            {isOffer && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#050606" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            <input type="checkbox" checked={isOffer} onChange={() => onOfferChange(!isOffer)} className="sr-only" />
          </div>
          <span className={'text-sm font-semibold ' + (isOffer ? 'text-[#B7D31A]' : 'text-[#C7C7C0] group-hover:text-[#F7F6F7]') + ' transition-colors'}>Solo ofertas</span>
        </label>
      </div>

      {categories.length > 0 && (
        <div className="mb-5 pb-5 border-b border-[#0D0F0F]">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8A85] mb-3">Categorias</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={'w-4 h-4 rounded border flex-none flex items-center justify-center transition-colors ' + (selectedCategory === cat.slug ? 'bg-[#B7D31A] border-[#B7D31A]' : 'border-[#0D0F0F] group-hover:border-[#8A8A85]')}>
                    {selectedCategory === cat.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#050606" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    <input type="checkbox" checked={selectedCategory === cat.slug} onChange={() => onCategoryChange(selectedCategory === cat.slug ? null : cat.slug)} className="sr-only" />
                  </div>
                  <span className={'text-sm ' + (selectedCategory === cat.slug ? 'text-[#F7F6F7] font-semibold' : 'text-[#C7C7C0] group-hover:text-[#F7F6F7]') + ' transition-colors truncate'}>{cat.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {brands.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8A85] mb-3">Marcas</h3>
          <ul className="space-y-2">
            {brands.map((brand) => (
              <li key={brand.id}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={'w-4 h-4 rounded border flex-none flex items-center justify-center transition-colors ' + (selectedBrand === brand.slug ? 'bg-[#B7D31A] border-[#B7D31A]' : 'border-[#0D0F0F] group-hover:border-[#8A8A85]')}>
                    {selectedBrand === brand.slug && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#050606" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    <input type="checkbox" checked={selectedBrand === brand.slug} onChange={() => onBrandChange(selectedBrand === brand.slug ? null : brand.slug)} className="sr-only" />
                  </div>
                  <span className={'text-sm ' + (selectedBrand === brand.slug ? 'text-[#F7F6F7] font-semibold' : 'text-[#C7C7C0] group-hover:text-[#F7F6F7]') + ' transition-colors truncate'}>{brand.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}