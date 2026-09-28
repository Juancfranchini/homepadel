'use client';

import { X } from 'lucide-react';
import CatalogSidebar from './CatalogSidebar';

interface Props {
  open: boolean;
  onClose: () => void;
  sidebarProps: React.ComponentProps<typeof CatalogSidebar>;
}

export default function CatalogMobileSidebar({ open, onClose, sidebarProps }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-page border-r border-line p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-fg font-semibold text-xs uppercase tracking-widest">Filtros</h2>
          <button onClick={onClose} className="text-fg-muted hover:text-fg"><X size={18} /></button>
        </div>
        <CatalogSidebar {...sidebarProps} />
      </div>
    </div>
  );
}
