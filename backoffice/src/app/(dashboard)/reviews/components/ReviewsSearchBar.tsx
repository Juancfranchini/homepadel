'use client';

import { Search, SlidersHorizontal, ListRestart } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAdvancedSearch: () => void;
  hasAdvancedFilters: boolean;
  onClearFilters: () => void;
}

export default function ReviewsSearchBar({ value, onChange, onAdvancedSearch, hasAdvancedFilters, onClearFilters }: Props) {
  return (
    <div className="flex">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar resena..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-56 pl-10 pr-4 py-2 bg-white border border-[#C8FF00]/50 rounded-l-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] transition-all"
        />
      </div>
      {hasAdvancedFilters ? (
        <button onClick={onClearFilters} className="flex items-center gap-1 px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-r-lg text-sm font-medium hover:bg-[#b8ef00] transition-colors border border-[#C8FF00]">
          <ListRestart className="w-4 h-4" />Limpiar
        </button>
      ) : (
        <button onClick={onAdvancedSearch} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-r-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200 border-l-0" title="Busqueda avanzada">
          <SlidersHorizontal className="w-4 h-4" />Avanzada
        </button>
      )}
    </div>
  );
}
