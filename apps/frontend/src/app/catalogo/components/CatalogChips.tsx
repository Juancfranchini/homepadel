import { X } from 'lucide-react';

interface Chip {
  label: string;
  onRemove: () => void;
}

interface Props {
  chips: Chip[];
  onClearAll: () => void;
}

export default function CatalogChips({ chips, onClearAll }: Props) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span key={chip.label} className="flex items-center gap-1.5 bg-[#B7D31A]/10 border border-[#B7D31A]/20 text-[#B7D31A] text-xs font-semibold px-3 py-1 rounded-full">
          {chip.label}
          <button onClick={chip.onRemove} className="hover:opacity-70"><X size={11} /></button>
        </span>
      ))}
      <button onClick={onClearAll} className="text-xs text-[#8A8A85] hover:text-[#F7F6F7] transition-colors px-2">
        Limpiar todos
      </button>
    </div>
  );
}