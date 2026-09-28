import Link from 'next/link';
import { WifiOff, RotateCw, PackageSearch, ArrowRight } from 'lucide-react';

export function ProductoSkeleton() {
  return (
    <div className="min-h-screen bg-page py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-fg/[0.04] rounded-2xl" />
        <div className="space-y-4"><div className="h-3 bg-fg/[0.06] rounded w-1/4" /><div className="h-8 bg-fg/[0.06] rounded w-3/4" /><div className="h-12 bg-fg/[0.06] rounded w-1/2" /></div>
      </div>
    </div>
  );
}

export function ProductoLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <WifiOff size={48} className="text-fg-muted mx-auto mb-4" />
        <p className="text-fg font-semibold text-lg mb-1">No pudimos cargar este producto</p>
        <p className="text-fg-soft text-sm mb-6">Hubo un problema de conexión. Probá de nuevo en unos segundos.</p>
        <button onClick={onRetry} className="inline-flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-6 py-2.5 rounded-xl text-sm font-semibold btn-primary-glow">
          <RotateCw size={16} /> Reintentar
        </button>
      </div>
    </div>
  );
}

export function ProductoNotFound() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <PackageSearch size={48} className="text-fg-muted mx-auto mb-4" />
        <p className="text-fg font-semibold text-lg mb-1">Este producto ya no está disponible</p>
        <p className="text-fg-soft text-sm mb-6">Puede que se haya descontinuado o que el link esté vencido.</p>
        <Link href="/catalogo" className="inline-flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-6 py-2.5 rounded-xl text-sm font-semibold btn-primary-glow">
          Ver catálogo <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
