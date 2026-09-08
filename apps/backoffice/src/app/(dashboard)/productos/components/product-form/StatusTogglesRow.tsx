import { Star } from 'lucide-react';
import Toggle from '../../../testimonios/components/Toggle';
import { labelClass } from './schema';

export default function StatusTogglesRow({ active, isNew, isOffer, featured, setValue }: {
  active: boolean; isNew: boolean; isOffer: boolean; featured: boolean; setValue: any;
}) {
  return (
    <div className="sm:col-span-2 grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 pt-1">
      <div>
        <label className={labelClass}>Activo</label>
        <div className="flex items-center gap-2 mt-1">
          <Toggle checked={active} onChange={() => setValue('active', !active, { shouldDirty: true })} />
          <span className={'text-xs font-medium ' + (active ? 'text-green-600' : 'text-gray-400')}>{active ? 'Si' : 'No'}</span>
        </div>
      </div>
      <div>
        <label className={labelClass}>Nuevo</label>
        <div className="flex items-center gap-2 mt-1">
          <Toggle checked={isNew} onChange={() => setValue('isNew', !isNew, { shouldDirty: true })} />
          <span className={'text-xs font-medium ' + (isNew ? 'text-blue-600' : 'text-gray-400')}>{isNew ? 'Si' : 'No'}</span>
        </div>
      </div>
      <div>
        <label className={labelClass}>Oferta</label>
        <div className="flex items-center gap-2 mt-1">
          <Toggle checked={isOffer} onChange={() => setValue('isOffer', !isOffer, { shouldDirty: true })} />
          <span className={'text-xs font-medium ' + (isOffer ? 'text-amber-600' : 'text-gray-400')}>{isOffer ? 'Si' : 'No'}</span>
        </div>
      </div>
      <div>
        <label className={labelClass}>Destacado</label>
        <div className="flex items-center gap-2 mt-1">
          <Toggle checked={featured} onChange={() => setValue('featured', !featured, { shouldDirty: true })} />
          <Star className={'w-5 h-5 ' + (featured ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-300')} />
        </div>
      </div>
    </div>
  );
}
