'use client';

import { FieldArrayWithId, FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import type { CuotasForm } from './page';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

interface Props {
  register: UseFormRegister<CuotasForm>;
  errors: FieldErrors<CuotasForm>;
  fields: FieldArrayWithId<CuotasForm, 'tramos'>[];
  append: UseFieldArrayAppend<CuotasForm, 'tramos'>;
  remove: UseFieldArrayRemove;
}

/** Tramos "desde tal monto, hasta N cuotas". */
export default function TramosFields({ register, errors, fields, append, remove }: Props) {
  return (
    <div className="space-y-2">
      <p className={labelClass}>Tramos</p>
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="flex-1">
            <input type="number" step="1" min="0" {...register(`tramos.${i}.desde`)} className={inputClass} placeholder="Desde $" aria-label="Desde monto" />
            {errors.tramos?.[i]?.desde && <p className="text-red-500 text-xs mt-1">{errors.tramos[i]?.desde?.message}</p>}
          </div>
          <div className="w-28">
            <input type="number" step="1" min="1" max="24" {...register(`tramos.${i}.cuotas`)} className={inputClass} placeholder="Cuotas" aria-label="Cuotas" />
            {errors.tramos?.[i]?.cuotas && <p className="text-red-500 text-xs mt-1">{errors.tramos[i]?.cuotas?.message}</p>}
          </div>
          <button type="button" onClick={() => remove(i)} className="p-2 text-gray-400 hover:text-red-500" aria-label="Quitar tramo"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => append({ desde: 0, cuotas: 3 })} className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"><Plus className="w-4 h-4" />Agregar tramo</button>
    </div>
  );
}
