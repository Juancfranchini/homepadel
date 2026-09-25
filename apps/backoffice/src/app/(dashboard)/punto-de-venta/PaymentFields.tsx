import { UseFormRegister } from 'react-hook-form';
import { PosFormData } from './posSchema';

const METHODS = [
  ['CASH', 'Efectivo'],
  ['TRANSFER', 'Transferencia'],
  ['CARD', 'Tarjeta'],
  ['DIGITAL_WALLET', 'Billetera virtual'],
  ['EXTERNAL_TERMINAL', 'Terminal externa'],
] as const;

interface Props {
  register: UseFormRegister<PosFormData>;
  cashOpen: boolean;
}

export function PaymentFields({ register, cashOpen }: Props) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold text-gray-900">Cobro</legend>
      {!cashOpen && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          No hay una caja abierta. Podés dejar la venta pendiente o usar un medio no efectivo.
        </p>
      )}
      <div className="space-y-2">
        <PaymentRow number={1} register={register} />
        <PaymentRow number={2} register={register} optional />
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Dejá los importes en cero para registrar una venta pendiente. Se admiten hasta dos medios.
      </p>
    </fieldset>
  );
}

function PaymentRow({
  number,
  register,
  optional = false,
}: {
  number: 1 | 2;
  register: UseFormRegister<PosFormData>;
  optional?: boolean;
}) {
  const method = `paymentMethod${number}` as const;
  const amount = `paymentAmount${number}` as const;
  const reference = `paymentReference${number}` as const;
  return (
    <div className="grid grid-cols-[1.2fr_0.8fr_1fr] gap-2">
      <select {...register(method)} className="rounded-lg border border-gray-200 px-2 py-2 text-sm">
        {optional && <option value="NONE">Sin segundo medio</option>}
        {METHODS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        {...register(amount)}
        aria-label={`Importe ${number}`}
        type="number"
        min="0"
        step="0.01"
        placeholder="Importe"
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />
      <input
        {...register(reference)}
        aria-label={`Referencia ${number}`}
        placeholder="Referencia"
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
