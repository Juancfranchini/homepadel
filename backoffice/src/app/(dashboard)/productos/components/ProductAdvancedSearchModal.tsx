'use client';

import { useState } from 'react';
import { X, Tag, Layers, Star, Package } from 'lucide-react';

export interface ProductAdvancedFilters {
  categoryId: string | null;
  brandId: string | null;
  active: boolean | null;
  featured: boolean | null;
}

interface Category { id: string; name: string }
interface Brand { id: string; name: string }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ProductAdvancedFilters) => void;
  categories: Category[];
  brands: Brand[];
}

const menuItems = [
  { id: 'category', label: 'Categoria', icon: Layers },
  { id: 'brand', label: 'Marca', icon: Package },
  { id: 'active', label: 'Estado', icon: Tag },
  { id: 'featured', label: 'Destacado', icon: Star },
];

type MenuSection = 'category' | 'brand' | 'active' | 'featured';

export default function ProductAdvancedSearchModal({ isOpen, onClose, onApply, categories, brands }: Props) {
  const [activeSection, setActiveSection] = useState<MenuSection>('category');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [featured, setFeatured] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const hasFilters = categoryId !== null || brandId !== null || active !== null || featured !== null;

  const handleClear = () => { setCategoryId(null); setBrandId(null); setActive(null); setFeatured(null); };
  const handleApply = () => { onApply({ categoryId, brandId, active, featured }); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Busqueda Avanzada</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Selecciona los filtros para buscar productos</p>
        </div>

        <div className="w-full h-px bg-gray-200" />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-48 flex-shrink-0 bg-gray-50 flex flex-col border-r border-gray-200">
            <div className="px-4 pt-3 pb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtros</span>
            </div>
            <div className="flex flex-col gap-1 px-2 pb-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as MenuSection)}
                    className={'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors ' +
                      (isActive ? 'bg-white border border-[#C8FF00] text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-100')}
                  >
                    <Icon className={'w-4 h-4 ' + (isActive ? 'text-[#C8FF00]' : 'text-gray-400')} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <p className="text-sm text-gray-500 mb-4">Escoja una opcion para filtrar</p>
            <div className="w-full h-px bg-gray-200 mb-4" />

            {activeSection === 'category' && (
              <div className="grid grid-cols-2 gap-3">
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (!categoryId ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="cat" checked={!categoryId} onChange={() => setCategoryId(null)} className="sr-only" />
                  <span className="text-sm font-medium">Todas</span>
                </label>
                {categories.map((c) => (
                  <label key={c.id} className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (categoryId === c.id ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                    <input type="radio" name="cat" checked={categoryId === c.id} onChange={() => setCategoryId(c.id)} className="sr-only" />
                    <span className="text-sm font-medium">{c.name}</span>
                  </label>
                ))}
              </div>
            )}

            {activeSection === 'brand' && (
              <div className="grid grid-cols-2 gap-3">
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (!brandId ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="brand" checked={!brandId} onChange={() => setBrandId(null)} className="sr-only" />
                  <span className="text-sm font-medium">Todas</span>
                </label>
                {brands.map((b) => (
                  <label key={b.id} className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (brandId === b.id ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                    <input type="radio" name="brand" checked={brandId === b.id} onChange={() => setBrandId(b.id)} className="sr-only" />
                    <span className="text-sm font-medium">{b.name}</span>
                  </label>
                ))}
              </div>
            )}

            {activeSection === 'active' && (
              <div className="grid grid-cols-2 gap-3">
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (active === null ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="act" checked={active === null} onChange={() => setActive(null)} className="sr-only" />
                  <span className="text-sm font-medium">Todos</span>
                </label>
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (active === true ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="act" checked={active === true} onChange={() => setActive(true)} className="sr-only" />
                  <span className="text-sm font-medium">Activos</span>
                </label>
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (active === false ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="act" checked={active === false} onChange={() => setActive(false)} className="sr-only" />
                  <span className="text-sm font-medium">Inactivos</span>
                </label>
              </div>
            )}

            {activeSection === 'featured' && (
              <div className="grid grid-cols-2 gap-3">
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (featured === null ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="feat" checked={featured === null} onChange={() => setFeatured(null)} className="sr-only" />
                  <span className="text-sm font-medium">Todos</span>
                </label>
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (featured === true ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="feat" checked={featured === true} onChange={() => setFeatured(true)} className="sr-only" />
                  <span className="text-sm font-medium">Destacados</span>
                </label>
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (featured === false ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="feat" checked={featured === false} onChange={() => setFeatured(false)} className="sr-only" />
                  <span className="text-sm font-medium">No destacados</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b flex-shrink-0">
          <button onClick={handleClear} disabled={!hasFilters} className={'text-sm font-medium ' + (hasFilters ? 'text-[#C8FF00] cursor-pointer hover:underline' : 'text-gray-400 cursor-not-allowed')}>Limpiar Filtros</button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-white transition-colors">Cancelar</button>
            <button onClick={handleApply} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] transition-colors">Buscar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
