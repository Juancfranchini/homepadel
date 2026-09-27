import { labelClass } from './schema';

const NIVELES = ['Principiante', 'Intermedio', 'Avanzado'] as const;
export type Nivel = (typeof NIVELES)[number];

/** Un solo nivel por paleta. Aparece como filtro en la tienda apenas alguna paleta lo tenga cargado. */
export default function LevelField({ value, onChange }: { value: string | null | undefined; onChange: (value: Nivel | null) => void }) {
  return (
    <div className="sm:col-span-2 border-t border-gray-100 pt-4">
      <label className={labelClass}>Nivel de juego</label>
      <div className="flex flex-wrap gap-4 mt-2">
        {NIVELES.map((nivel) => (
          <label key={nivel} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              name="level"
              value={nivel}
              checked={value === nivel}
              onChange={() => onChange(nivel)}
              className="w-4 h-4 accent-[#C8FF00]"
            />
            {nivel}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="radio"
            name="level"
            value=""
            checked={!value}
            onChange={() => onChange(null)}
            className="w-4 h-4 accent-[#C8FF00]"
          />
          Sin especificar
        </label>
      </div>
    </div>
  );
}
