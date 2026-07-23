'use client';

import { useState } from 'react';
import { X, Tag, Package, Star, ImageIcon } from 'lucide-react';

export interface ReviewsAdvancedFilters {
  productId: string | null;
  active: boolean | null;
  rating: number | null;
}

interface Product { id: string; name: string; images?: string[] }

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');
function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ReviewsAdvancedFilters) => void;
  products: Product[];
}

const menuItems = [
  { id: 'product', label: 'Producto', icon: Package },
  { id: 'active', label: 'Estado', icon: Tag },
  { id: 'rating', label: 'Puntuacion', icon: Star },
];

type MenuSection = 'product' | 'active' | 'rating';

export default function ReviewsAdvancedSearchModal({ isOpen, onClose, onApply, products }: Props) {
  const [activeSection, setActiveSection] = useState<MenuSection>('product');
  const [productId, setProductId] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  if (!isOpen) return null;

  const hasFilters = productId !== null || active !== null || rating !== null;
  const handleClear = () => { setProductId(null); setActive(null); setRating(null); };
  const handleApply = () => { onApply({ productId, active, rating }); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Busqueda Avanzada</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Filtrar por producto, estado y puntuacion</p>
        </div>

        <div className="w-full h-px bg-gray-200" />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-48 flex-shrink-0 bg-gray-50 flex flex-col border-r border-gray-200">
            <div className="px-4 pt-3 pb-2"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtros</span></div>
            <div className="flex flex-col gap-1 px-2 pb-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveSection(item.id as MenuSection)}
                    className={'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors ' +
                      (isActive ? 'bg-white border border-[#C8FF00] text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-100')}>
                    <Icon className={'w-4 h-4 ' + (isActive ? 'text-[#C8FF00]' : 'text-gray-400')} />{item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <p className="text-sm text-gray-500 mb-4">Escoja una opcion para filtrar</p>
            <div className="w-full h-px bg-gray-200 mb-4" />

            {activeSection === 'product' && (
              <div className="grid grid-cols-2 gap-3">
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (!productId ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="prod" checked={!productId} onChange={() => setProductId(null)} className="sr-only" />
                  <span className="text-sm font-medium">Todos</span>
                </label>
                {products.map((p) => {
                  const img = getImageUrl(p.images?.[0]);
                  return (
                    <label key={p.id} className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (productId === p.id ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                      <input type="radio" name="prod" checked={productId === p.id} onChange={() => setProductId(p.id)} className="sr-only" />
                      {img ? <img src={img} alt="" className="w-6 h-6 rounded object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300" />}
                      <span className="text-sm font-medium truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {activeSection === 'active' && (
              <div className="grid grid-cols-2 gap-3">
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (active === null ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="act" checked={active === null} onChange={() => setActive(null)} className="sr-only" /><span className="text-sm font-medium">Todas</span></label>
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (active === true ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="act" checked={active === true} onChange={() => setActive(true)} className="sr-only" /><span className="text-sm font-medium">Aprobadas</span></label>
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (active === false ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="act" checked={active === false} onChange={() => setActive(false)} className="sr-only" /><span className="text-sm font-medium">Pendientes</span></label>
              </div>
            )}

            {activeSection === 'rating' && (
              <div className="grid grid-cols-2 gap-3">
                <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (!rating ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="rat" checked={!rating} onChange={() => setRating(null)} className="sr-only" /><span className="text-sm font-medium">Todas</span></label>
                {[5,4,3,2,1].map((r) => (
                  <label key={r} className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (rating === r ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                    <input type="radio" name="rat" checked={rating === r} onChange={() => setRating(r)} className="sr-only" />
                    <span className="text-sm font-medium">{''.repeat(r)} {r}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b flex-shrink-0">
          <button onClick={handleClear} disabled={!hasFilters} className={'text-sm font-medium ' + (hasFilters ? 'text-[#C8FF00] cursor-pointer hover:underline' : 'text-gray-400 cursor-not-allowed')}>Limpiar Filtros</button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-white">Cancelar</button>
            <button onClick={handleApply} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00]">Buscar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
