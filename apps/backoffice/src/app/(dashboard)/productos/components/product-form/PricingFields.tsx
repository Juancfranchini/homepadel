import { inputClass, labelClass } from './schema';

export default function PricingFields({ register, errors, hasSalePrice, onToggleSalePrice }: {
  register: any; errors: any; hasSalePrice: boolean; onToggleSalePrice: (checked: boolean) => void;
}) {
  return (
    <>
      <div>
        <label className={labelClass}>Precio de Venta *</label>
        <input type="number" step="0.01" {...register('price')} className={inputClass + ' mt-1'} />
        {errors.price && <p className="text-xs text-red-600 mt-0.5">{errors.price.message}</p>}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="checkbox"
            checked={hasSalePrice}
            onChange={(e) => onToggleSalePrice(e.target.checked)}
            className="w-4 h-4 rounded accent-[#C8FF00] cursor-pointer"
            id="hasSalePrice"
          />
          <label htmlFor="hasSalePrice" className="text-xs font-medium text-gray-500 cursor-pointer select-none">Activar precio promocional</label>
        </div>
        <input
          type="number"
          step="0.01"
          {...register('salePrice', {
            validate: (val: any) => {
              if (hasSalePrice) {
                const numVal = Number(val);
                if (!val || isNaN(numVal) || numVal <= 0) return 'El precio promocional es obligatorio';
              }
              return true;
            },
          })}
          className={inputClass + ' mt-1 ' + (hasSalePrice ? '' : 'bg-gray-50 text-gray-400 cursor-not-allowed') + (errors.salePrice ? ' border-red-400 focus:ring-red-400/40 focus:border-red-400' : '')}
          placeholder={hasSalePrice ? 'Ej: 150000' : 'Desactivado'}
          readOnly={!hasSalePrice}
        />
        {errors.salePrice && <p className="text-xs text-red-600 mt-0.5">{errors.salePrice.message}</p>}
        {!hasSalePrice && <p className="text-[10px] text-gray-400 mt-1">Marca el checkbox para activar precio promocional.</p>}
      </div>
      <div>
        <label className={labelClass}>Precio Transferencia/Deposito</label>
        <input type="number" step="0.01" {...register('transferPrice')} className={inputClass + ' mt-1'} placeholder="Opcional" />
      </div>
    </>
  );
}
