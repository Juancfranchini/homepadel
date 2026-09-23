'use client';

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
  /** Valores de género realmente cargados. Vacío mientras nadie los use. */
  genders: string[];
  selectedGender: string;
  onSizeChange: (value: string | null) => void;
  onColorChange: (value: string | null) => void;
  onWeightChange: (value: string | null) => void;
  onShapeChange: (value: string | null) => void;
  onGenderChange: (value: string | null) => void;
}

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

/**
 * Contenido de una sección de filtros de la barra lateral.
 *
 * Se renderiza dentro de la barra, debajo del control que la abre. Antes vivía
 * en un panel flotante con su propia capa y su botón de cerrar, que se
 * superponía al listado y lo empujaba a la derecha.
 *
 * Los atributos van agrupados en una sola sección. Antes estaban repartidos por
 * criterios que no se sostenían —formato y talle colgaban de "Categorías",
 * color y peso de "Marcas"—, así que encontrarlos dependía de adivinar.
 */
export default function CatalogSidebarPanel(props: PanelProps & { activePanel: ActivePanel }) {
  const { activePanel } = props;
  if (activePanel === 'categories') return <CategoriesSection {...props} />;
  if (activePanel === 'brands') return <BrandsSection {...props} />;
  if (activePanel === 'attributes') return <AttributesSection {...props} />;
  if (activePanel === 'sort') return <SortSection {...props} />;
  return null;
}

function CategoriesSection({ categories, selectedCategory, onCategoryChange }: PanelProps) {
  return (
    <div>
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
    colors, selectedColor, onColorChange, weights, selectedWeight, onWeightChange,
    genders, selectedGender, onGenderChange } = props;

  const mostrarFormato = selectedCategory === 'paletas';
  // El género se ofrece solo si algún producto lo tiene cargado: igual que
  // talle, color y peso, las opciones salen de los datos. Un filtro fijo de
  // Hombre/Mujer/Unisex devolvería cero resultados hasta que se cargue.
  const hayAlguno = mostrarFormato || genders.length > 0 || sizes.length > 0 || colors.length > 0 || weights.length > 0;

  if (!hayAlguno) {
    return (
      <div>
        <p className="text-xs text-[#8A8A85]">No hay atributos para filtrar en esta selección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {genders.length > 0 && (
        <CatalogAttributeSelect label="Género" value={selectedGender} options={toOptions(genders)} onChange={onGenderChange} />
      )}
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
