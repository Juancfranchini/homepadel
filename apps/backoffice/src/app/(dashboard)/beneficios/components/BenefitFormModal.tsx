import { createElement } from 'react';
import { Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Benefit, ICON_OPTIONS, ICON_MAP } from '../useBeneficios';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function BenefitFormModal({ isOpen, editItem, register, errors, watchIcon, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: Benefit | null; register: any; errors: any; watchIcon: string; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar beneficio' : 'Nuevo beneficio'} size="sm">
      <form onSubmit={onSubmit} className="space-y-4 px-4 sm:px-6 py-4 sm:py-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Icono *</label>
          <div className="relative">
            <select {...register('icon')} className={inputClass + ' pl-10'}>
              {ICON_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8FF00] pointer-events-none">
              {createElement(ICON_MAP[watchIcon] || Star, { size: 16 })}
            </span>
          </div>
          {errors.icon && <p className="text-xs text-red-600 mt-1">{errors.icon.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
          <input {...register('title')} className={inputClass} placeholder="Ej: Envio gratis" />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
          <input {...register('description')} className={inputClass} placeholder="En compras mayores a $50.000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
          <input type="number" min={0} {...register('order')} className={inputClass} />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="bActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label htmlFor="bActive" className="text-sm text-gray-700">Activo</label>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}
