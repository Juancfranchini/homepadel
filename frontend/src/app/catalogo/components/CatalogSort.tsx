'use client';

import { useState } from 'react';
import { ArrowDownUp, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Novedades' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CatalogSort({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const currentLabel = SORT_OPTIONS.find(o => o.value === value)?.label || 'Ordenar';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-[#0C0C0C] border border-[#0D0F0F] rounded-lg text-sm text-[#F7F6F7] hover:border-[#B7D31A] transition-colors"
      >
        <ArrowDownUp size={14} className="text-[#B7D31A]" />
        <span className="hidden sm:inline">{currentLabel}</span>
        <ChevronDown size={14} className="text-[#8A8A85]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-[#0C0C0C] border border-[#0D0F0F] rounded-xl shadow-2xl overflow-hidden">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={'w-full text-left px-4 py-2.5 text-sm transition-colors ' +
                  (value === opt.value ? 'text-[#B7D31A] bg-[#B7D31A]/5' : 'text-[#C7C7C0] hover:text-[#F7F6F7] hover:bg-white/[0.04]')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}