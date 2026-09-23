import { labelClass } from './schema';

const SHAPES = ['Diamante', 'Lagrima', 'Redondo'];

export default function ShapeField({ value, onChange }: { value: string | null | undefined; onChange: (value: string | null) => void }) {
  return (
    <div className="sm:col-span-2 border-t border-gray-100 pt-4">
      <label className={labelClass}>Formato de paleta</label>
      <div className="flex flex-wrap gap-4 mt-2">
        {SHAPES.map((shape) => (
          <label key={shape} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              name="shape"
              value={shape}
              checked={value === shape}
              onChange={() => onChange(shape)}
              className="w-4 h-4 accent-[#C8FF00]"
            />
            {shape}
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