'use client';

import CatalogSearch from './CatalogSearch';

interface Props {
  pageTitle: string;
  loading: boolean;
  totalCount: number;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function CatalogHeader({ pageTitle, loading, totalCount, searchInput, onSearchInputChange, onSearchSubmit }: Props) {
  return (
    <div className="border-b border-line bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <p className="text-[11px] text-fg-muted mb-1">
          Inicio <span className="mx-1">/</span> <span className="text-fg">{pageTitle}</span>
        </p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-semibold uppercase tracking-tight text-fg">
            {pageTitle}
            {!loading && <span className="ml-3 text-sm font-normal text-fg-muted normal-case">{totalCount} productos</span>}
          </h1>
          <CatalogSearch value={searchInput} onChange={onSearchInputChange} onSubmit={onSearchSubmit} />
        </div>
      </div>
    </div>
  );
}
