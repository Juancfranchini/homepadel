'use client';

import { ReactNode } from 'react';

interface ResponsiveHeaderProps {
  title: string;
  count?: number;
  children?: ReactNode;
}

export default function ResponsiveHeader({ title, count, children }: ResponsiveHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {count !== undefined && (
            <p className="text-gray-500 text-sm mt-0.5">{count} registros</p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2 w-full">
          {children}
        </div>
      )}
    </div>
  );
}
