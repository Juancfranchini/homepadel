import { UseFormRegister } from 'react-hook-form';
import { PosFormData } from './posSchema';
import { PosBranch } from './types';

interface Props {
  branches: PosBranch[];
  register: UseFormRegister<PosFormData>;
}

export function SaleOptionsFields({ branches, register }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-bold text-gray-900">Operación</legend>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-medium text-gray-600">
          Canal
          <select
            {...register('channel')}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="LOCAL">Local</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="SOCIAL">Otra red</option>
            <option value="PHONE">Teléfono</option>
          </select>
        </label>
        <label className="text-xs font-medium text-gray-600">
          Sucursal
          <select
            {...register('branchId')}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Seleccionar</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs font-medium text-gray-600">
          Descuento
          <select
            {...register('discountType')}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
          >
            <option value="AMOUNT">Importe</option>
            <option value="PERCENTAGE">%</option>
          </select>
        </label>
        <label className="text-xs font-medium text-gray-600">
          Valor
          <input
            {...register('discountValue')}
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-gray-600">
          Envío
          <input
            {...register('shipping')}
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="block text-xs font-medium text-gray-600">
        Notas
        <textarea
          {...register('notes')}
          rows={2}
          className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </label>
    </fieldset>
  );
}
