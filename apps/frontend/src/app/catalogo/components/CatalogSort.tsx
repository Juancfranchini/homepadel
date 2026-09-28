'use client';

import { useState } from 'react';
import { ArrowDownUp, ChevronDown } from 'lucide-react';

import { SORT_OPTIONS, sortLabel } from '../sortOptions';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CatalogSort({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const currentLabel = sortLabel(value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-panel border border-line rounded-lg text-sm text-fg hover:border-[#B7D31A] transition-colors"
      >
        <ArrowDownUp size={14} className="text-brand-fg" />
        <span className="hidden sm:inline">{currentLabel}</span>
        <ChevronDown size={14} className="text-fg-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-panel border border-line rounded-xl shadow-2xl overflow-hidden">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={'w-full text-left px-4 py-2.5 text-sm transition-colors ' +
                  (value === opt.value ? 'text-brand-fg bg-[#B7D31A]/5' : 'text-fg-soft hover:text-fg hover:bg-fg/[0.04]')}
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