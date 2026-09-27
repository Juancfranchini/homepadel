import { labelClass } from './schema';

// El valor es el que se guarda y filtra (sin tilde, como los ya cargados); la etiqueta es la que se lee.
const SHAPES = [
  { valor: 'Diamante', etiqueta: 'Diamante' },
  { valor: 'Lagrima', etiqueta: 'Lágrima' },
  { valor: 'Redondo', etiqueta: 'Redondo' },
  { valor: 'Hibrido', etiqueta: 'Híbrido' },
];

export default function ShapeField({ value, onChange }: { value: string | null | undefined; onChange: (value: string | null) => void }) {
  return (
    <div className="sm:col-span-2 border-t border-gray-100 pt-4">
      <label className={labelClass}>Formato de paleta</label>
      <div className="flex flex-wrap gap-4 mt-2">
        {SHAPES.map(({ valor, etiqueta }) => (
          <label key={valor} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              name="shape"
              value={valor}
              checked={value === valor}
              onChange={() => onChange(valor)}
              className="w-4 h-4 accent-[#C8FF00]"
            />
            {etiqueta}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="radio"
            name="shape"
            value=""
            checked={!value}
            onChange={() => onChange(null)}
            className="w-4 h-4 accent-[#C8FF00]"
          />
          Sin especificar
        </label>
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Solo aplica a productos de la categoria Paletas.</p>
    </div>
  );
}
