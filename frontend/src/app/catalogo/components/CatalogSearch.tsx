'use client';

import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CatalogSearch({ value, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A85]" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar producto..."
          className="w-56 pl-10 pr-4 py-2 bg-[#0A0F12] border border-[#B7D31A]/50 rounded-lg text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20 transition-all"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-[#B7D31A] text-[#050606] rounded-lg text-xs font-semibold uppercase tracking-wide btn-primary-glow">
        Buscar
      </button>
    </form>
  );
}