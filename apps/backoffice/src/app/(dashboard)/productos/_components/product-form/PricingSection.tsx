import { DollarSign } from 'lucide-react';
import { SectionCard, Label, ErrorMsg } from './shared';

export default function PricingSection({ register, errors }: { register: any; errors: any }) {
  return (
    <SectionCard icon={<DollarSign className="w-4 h-4" />} title="Precios">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Precio normal ($)</Label>
          <input type="number" min={0} step={100} {...register('price')} className="input-field" placeholder="0" />
          <ErrorMsg msg={errors.price?.message} />
        </div>
        <div>
          <Label>Precio oferta ($) <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <input type="number" min={0} step={100} {...register('salePrice')} className="input-field" placeholder="0" />
          <p className="text-xs text-gray-400 mt-1">Se muestra tachado el precio normal cuando es menor</p>
        </div>
        <div>
          <Label>Precio por transferencia ($) <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <input type="number" min={0} step={100} {...register('transferPrice')} className="input-field" placeholder="0" />
          <p className="text-xs text-gray-400 mt-1">Si no se configura, se muestra 80% del precio activo</p>
        </div>
        <div className="flex items-end">
          <div className="bg-gray-50 rounded-lg p-3 w-full text-xs text-gray-600">
            📦 <strong>9 cuotas sin interés</strong> = precio activo ÷ 9<br />
            <span className="text-gray-400">(calculado automáticamente)</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
