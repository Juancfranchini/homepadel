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
        // Todo el chip quita el filtro: la X sola era un blanco de 11 px, difícil de tocar en el celular.
        <button
          key={chip.label}
          type="button"
          onClick={chip.onRemove}
          aria-label={'Quitar filtro ' + chip.label}
          className="flex items-center gap-1.5 bg-[#B7D31A]/10 border border-[#B7D31A]/20 text-brand-fg text-xs font-semibold px-3 py-1 rounded-full hover:bg-[#B7D31A]/20 transition-colors"
        >
          {chip.label}
          <X size={11} aria-hidden="true" />
        </button>
      ))}
      <button onClick={onClearAll} className="text-xs text-fg-muted hover:text-fg transition-colors px-2">
        Limpiar todos
      </button>
    </div>
  );
}