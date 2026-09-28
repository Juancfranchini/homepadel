'use client';

import { Plus, X } from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

interface Props {
  loading: boolean;
  categories: string[];
  grouped: Record<string, FaqItem[]>;
  isOpen: (id: string) => boolean;
  onToggle: (id: string) => void;
}

export default function FaqAccordionList({ loading, categories, grouped, isOpen, onToggle }: Props) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-fg-muted text-sm">Cargando...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-fg-muted text-sm">No hay preguntas disponibles.</p>
      </div>
    );
  }

  return (
    <>
      {categories.map((cat) => (
        <div key={cat} className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-fg mb-5 flex items-center gap-2">
            <span className="w-4 h-px bg-[#B7D31A]" />
            {cat}
          </h2>
          <div className="space-y-3">
            {grouped[cat].map((item) => {
              const open = isOpen(item.id);
              return (
                <div key={item.id} className="bg-ocean border border-line rounded-2xl overflow-hidden">
                  <button
                    onClick={() => onToggle(item.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="text-fg font-semibold text-sm">{item.question}</span>
                    <div className={'flex-shrink-0 transition-transform duration-300 ' + (open ? 'rotate-180' : '')}>
                      {open ? (
                        <X size={18} className="text-brand-fg" />
                      ) : (
                        <Plus size={18} className="text-brand-fg" />
                      )}
                    </div>
                  </button>
                  <div className={'overflow-hidden transition-all duration-300 ' + (open ? 'max-h-96' : 'max-h-0')}>
                    <div className="px-6 pb-5">
                      <p className="text-fg-soft text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
