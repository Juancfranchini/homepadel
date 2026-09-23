import { labelClass } from './schema';

const GENDERS = ['Hombre', 'Mujer', 'Unisex'];

/**
 * Género del producto.
 *
 * A diferencia del formato de paleta, aplica a cualquier categoría —una
 * remera, unas zapatillas, un bolso—, así que se muestra siempre. "Sin
 * especificar" es una opción válida: el filtro del catálogo solo ofrece los
 * géneros que estén realmente cargados, así que dejarlo vacío no rompe nada.
 */
export default function GenderField({ value, onChange }: { value: string | null | undefined; onChange: (value: string | null) => void }) {
  return (
    <div className="sm:col-span-2 border-t border-gray-100 pt-4">
      <label className={labelClass}>Género</label>
      <div className="flex flex-wrap gap-4 mt-2">
        {GENDERS.map((gender) => (
          <label key={gender} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value={gender}
              checked={value === gender}
              onChange={() => onChange(gender)}
              className="w-4 h-4 accent-[#C8FF00]"
            />
            {gender}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value=""
            checked={!value}
            onChange={() => onChange(null)}
            className="w-4 h-4 accent-[#C8FF00]"
          />
          Sin especificar
        </label>
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Aparece como filtro en el catalogo solo si algun producto lo tiene cargado.</p>
    </div>
  );
}
