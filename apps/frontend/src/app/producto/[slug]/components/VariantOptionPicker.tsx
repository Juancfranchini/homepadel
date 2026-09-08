'use client';

interface Props {
  label: string;
  selected: string | null;
  options: string[];
  onChange: (value: string) => void;
  minWidth?: boolean;
}

export default function VariantOptionPicker({ label, selected, options, onChange, minWidth }: Props) {
  return (
    <div>
      <p className="text-xs sm:text-sm font-semibold text-[#F7F6F7] mb-2">
        {label}: {selected || 'Seleccionar'}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={(minWidth ? 'min-w-[48px] ' : '') + 'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide border transition-all ' +
              (selected === option
                ? 'bg-[#B7D31A] text-[#050606] border-[#B7D31A]'
                : 'bg-[#1A1F21] text-[#C7C7C0] border-[#0D0F0F] hover:border-[#8A8A85]')}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
