import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { PosFormData } from './posSchema';
import { PosCustomer } from './types';

interface Props {
  customers: PosCustomer[];
  customerId?: string;
  register: UseFormRegister<PosFormData>;
  errors: FieldErrors<PosFormData>;
}

export function CustomerFields({ customers, customerId, register, errors }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-bold text-gray-900">Cliente</legend>
      <label className="block text-xs font-medium text-gray-600">
        Cliente existente
        <select
          {...register('customerId')}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        >
          <option value="">Consumidor final / nuevo</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} · {customer.email}
            </option>
          ))}
        </select>
      </label>
      {!customerId && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="text-xs font-medium text-gray-600">
            Nombre
            <input
              {...register('customerName')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-gray-600">
            Email
            <input
              {...register('customerEmail')}
              type="email"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            {errors.customerEmail && (
              <span className="text-xs text-red-600">{errors.customerEmail.message}</span>
            )}
          </label>
          <label className="text-xs font-medium text-gray-600">
            Teléfono
            <input
              {...register('customerPhone')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-gray-600">
            Dirección
            <input
              {...register('customerAddress')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}
    </fieldset>
  );
}
