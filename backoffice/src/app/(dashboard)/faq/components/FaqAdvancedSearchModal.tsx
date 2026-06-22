'use client';

import { useState } from 'react';
import { X, Tag } from 'lucide-react';

export interface FaqAdvancedFilters {
  category: string | null;
  active: boolean | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FaqAdvancedFilters) => void;
}

const CATEGORIES = ['COMPRAS', 'ENVIOS', 'PAGOS', 'DEVOLUCIONES', 'PRODUCTOS', 'General'];

export default function FaqAdvancedSearchModal({ isOpen, onClose, onApply }: Props) {
  const [category, setCategory] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const hasFilters = category !== null || active !== null;

  const handleClear = () => { setCategory(null); setActive(null); };
  const handleApply = () => { onApply({ category, active }); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Busqueda Avanzada</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Filtrar por categoria y estado</p>
        </div>
        <div className="w-full h-px bg-gray-200" />
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (!category ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                <input type="radio" name="cat" checked={!category} onChange={() => setCategory(null)} className="sr-only" />
                <span className="text-sm font-medium">Todas</span>
              </label>
              {CATEGORIES.map((c) => (
                <label key={c} className={'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ' + (category === c ? 'border-[#C8FF00] bg-[#C8FF00]/5 text-[#C8FF00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <input type="radio" name="cat" checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
                  <span className="text-sm font-medium">{c}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Estado</label>
            <div className="grid grid-cols-3 gap-2">
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