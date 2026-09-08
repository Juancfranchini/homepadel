import Toggle from '../../../testimonios/components/Toggle';
import { inputClass, labelClass } from './schema';

export default function DiscountInstallmentsFields({ register, hasInstallmentsInterest, onToggleInterest }: {
  register: any; hasInstallmentsInterest: boolean; onToggleInterest: () => void;
}) {
  return (
    <>
      <div>
        <label className={labelClass}>% Descuento</label>
        <input type="number" step="0.1" min="0" max="100" {...register('discountPercentage')} className={inputClass + ' mt-1'} placeholder="Ej: 15" />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Cuotas (Mercado Pago)</label>
        <select {...register('installments')} className={inputClass + ' mt-1'}>
          <option value="">Sin cuotas</option>
          <option value="3">3 cuotas</option>
          <option value="6">6 cuotas</option>
          <option value="9">9 cuotas</option>
          <option value="12">12 cuotas</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Interes en cuotas</label>
          <div className="flex items-center gap-2">
            <Toggle checked={hasInstallmentsInterest} onChange={onToggleInterest} />
            <span className={'text-xs font-medium ' + (hasInstallmentsInterest ? 'text-red-600' : 'text-gray-400')}>{hasInstallmentsInterest ? 'Con interes' : 'Sin interes'}</span>
          </div>
        </div>
        {hasInstallmentsInterest && (
          <div className="mt-2">
            <label className={labelClass}>% Interes</label>
            <input type="number" step="0.1" min="0" {...register('installmentsInterest')} className={inputClass + ' mt-1'} placeholder="Ej: 5" />
          </div>
        )}
      </div>
    </>
  );
}
