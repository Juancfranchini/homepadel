'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, Edit2 } from 'lucide-react';
import { Product } from '../useProductosPage';
import { problemasDeFicha } from '../revisionFicha';

interface Props {
  products: Product[];
  onEdit: (p: Product) => void;
}

/** Fichas activas con algo para corregir antes de pautarlas. */
export default function RevisionFichas({ products, onEdit }: Props) {
  const [abierto, setAbierto] = useState(false);
  const aRevisar = products
    .filter((p) => p.active)
    .map((p) => ({ p, problemas: problemasDeFicha(p) }))
    .filter((r) => r.problemas.length > 0);
  if (aRevisar.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl">
      <button type="button" onClick={() => setAbierto(!abierto)} className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
          <AlertTriangle className="w-4 h-4" /> {aRevisar.length} {aRevisar.length === 1 ? 'ficha activa a revisar' : 'fichas activas a revisar'} antes de pautar
        </span>
        <ChevronDown className={'w-4 h-4 text-amber-700 transition-transform ' + (abierto ? 'rotate-180' : '')} />
      </button>
      {abierto && (
        <ul className="border-t border-amber-200 divide-y divide-amber-100">
          {aRevisar.map(({ p, problemas }) => (
            <li key={p.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-amber-800">{problemas.join(' · ')}</p>
              </div>
              <button type="button" onClick={() => onEdit(p)} className="shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                <Edit2 className="w-3.5 h-3.5" /> Corregir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
