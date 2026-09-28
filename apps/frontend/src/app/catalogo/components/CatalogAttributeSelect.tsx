interface Props {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string | null) => void;
}

/** Selector de un atributo del catálogo (formato, talle, color, peso). */
export default function CatalogAttributeSelect({ label, value, options, onChange }: Props) {
  const id = 'filtro-' + label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-fg-muted bg-page px-2 py-2 text-sm text-fg"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
