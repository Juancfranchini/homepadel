'use client';

import { ChevronLeft } from 'lucide-react';
import { Category, Brand } from '@/types';
import { SORT_OPTIONS } from '../sortOptions';
import CatalogCheckboxOption from './CatalogCheckboxOption';
import CatalogAttributeSelect from './CatalogAttributeSelect';

export type ActivePanel = 'categories' | 'brands' | 'attributes' | 'sort' | null;

const SHAPE_OPTIONS = [
  { value: 'Diamante', label: 'Diamante' },
  { value: 'Lagrima', label: 'Lágrima' },
  { value: 'Redondo', label: 'Redondo' },
];

export interface PanelProps {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  currentSort: string;
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
  selectedShape: string;
  onSizeChange: (value: string | null) => void;
  onColorChange: (value: string | null) => void;
  onWeightChange: (value: string | null) => void;
  onShapeChange: (value: string | null) => void;
}

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

/**
 * Contenido del panel lateral del catálogo.
 *
 * Los atributos quedaron agrupados en una sola sección. Antes estaban repartidos
 * por criterios que no se sostenían —formato y talle colgaban de "Categorías",
 * color y peso de "Marcas"—, así que encontrarlos dependía de adivinar.
 */
export default function CatalogSidebarPanel(props: PanelProps & { activePanel: ActivePanel; onClose: () => void }) {
  const { activePanel, onClose, hasFilters, onClear } = props;
  if (!activePanel) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="animate-fade-in relative z-20 ml-2 w-56 rounded-2xl border border-[#0D0F0F] bg-[#0C0C0C] p-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-[#C7C7C0] transition-colors hover:bg-white/[0.08] hover:text-[#F7F6F7]"
          title="Cerrar panel"
        >
          <ChevronLeft size={16} />
        </button>

        <PanelBody {...props} />

        {hasFilters && (
          <button onClick={onClear} className="mt-4 text-xs font-medium text-red-400 hover:text-red-300">
            Limpiar filtros
          </button>
        )}
      </div>
    </>
  );
}

function PanelBody(props: PanelProps & { activePanel: ActivePanel }) {
  const { activePanel } = props;
  if (activePanel === 'categories') return <CategoriesSection {...props} />;
  if (activePanel === 'brands') return <BrandsSection {...props} />;
  if (activePanel === 'attributes') return <AttributesSection {...props} />;
  if (activePanel === 'sort') return <SortSection {...props} />;
  return null;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 pr-6 text-xs font-semibold uppercase tracking-wider text-[#F7F6F7]">{children}</h3>;
}

function CategoriesSection({ categories, selectedCategory, onCategoryChange }: PanelProps) {
  return (
    <div>
      <SectionTitle>Categorías</SectionTitle>
      <div className="space-y-2">
        {categories.map((cat) => (
          <CatalogCheckboxOption
            key={cat.id}
            label={cat.name}
            checked={selectedCategory === cat.slug}
            onChange={() => onCategoryChange(selectedCategory === cat.slug ? null : cat.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function BrandsSection({ brands, selectedBrand, onBrandChange }: PanelProps) {
  return (
    <div>
      <SectionTitle>Marcas</SectionTitle>
      <div className="space-y-2">
        {brands.map((brand) => (
          <CatalogCheckboxOption
            key={brand.id}
            label={brand.name.trim()}
            checked={selectedBrand === brand.slug}
            onChange={() => onBrandChange(selectedBrand === brand.slug ? null : brand.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function AttributesSection(props: PanelProps) {
  const { selectedCategory, selectedShape, onShapeChange, sizes, selectedSize, onSizeChange,
    colors, selectedColor, onColorChange, weights, selectedWeight, onWeightChange } = props;

  const mostrarFormato = selectedCategory === 'paletas';
  const hayAlguno = mostrarFormato || sizes.length > 0 || colors.length > 0 || weights.length > 0;

  if (!hayAlguno) {
    return (
      <div>
        <SectionTitle>Atributos</SectionTitle>
        <p className="text-xs text-[#8A8A85]">No hay atributos para filtrar en esta selección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Atributos</SectionTitle>
      {mostrarFormato && (
        <CatalogAttributeSelect label="Formato" value={selectedShape} options={SHAPE_OPTIONS} onChange={onShapeChange} />
      )}
      {sizes.length > 0 && (
        <CatalogAttributeSelect label="Talle" value={selectedSize} options={toOptions(sizes)} onChange={onSizeChange} />
      )}
      {colors.length > 0 && (
        <CatalogAttributeSelect label="Color" value={selectedColor} options={toOptions(colors)} onChange={onColorChange} />
      )}
      {weights.length > 0 && (
        <CatalogAttributeSelect label="Peso" value={selectedWeight} options={toOptions(weights)} onChange={onWeightChange} />
      )}
    </div>
  );
}

function SortSection({ currentSort, onSortChange }: PanelProps) {
  return (
    <div>
      <SectionTitle>Ordenar por</SectionTitle>
      <div className="space-y-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={
              'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ' +
              (currentSort === opt.value
                ? 'bg-[#B7D31A]/5 text-[#B7D31A]'
                : 'text-[#C7C7C0] hover:bg-white/[0.04] hover:text-[#F7F6F7]')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
