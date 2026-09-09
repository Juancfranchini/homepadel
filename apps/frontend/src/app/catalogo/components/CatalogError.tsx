import { WifiOff, RotateCw } from 'lucide-react';

interface Props {
  onRetry: () => void;
}

export default function CatalogError({ onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <WifiOff size={48} className="text-[#8A8A85] mb-4" />
      <p className="text-[#F7F6F7] font-semibold text-lg mb-1">No pudimos cargar el catálogo</p>
      <p className="text-[#C7C7C0] text-sm mb-6">Hubo un problema de conexión. Probá de nuevo en unos segundos.</p>
      <button onClick={onRetry} className="flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-6 py-2.5 rounded-xl text-sm font-semibold btn-primary-glow">
        <RotateCw size={16} /> Reintentar
      </button>
    </div>
  );
}
