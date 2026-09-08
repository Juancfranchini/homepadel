import { Modal } from '@/components/ui/Modal';
import { Promotion } from '../usePromociones';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function PromotionFormModal({ isOpen, editItem, register, errors, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: Promotion | null; register: any; errors: any; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar promoción' : 'Nueva promoción'} size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Título *</label>
          <input {...register('title')} className={inputClass} placeholder="Ej: Black Friday" />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea {...register('description')} rows={2} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Descuento (%) *</label>
            <input type="number" {...register('discount')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto del botón</label>
            <input {...register('ctaText')} className={inputClass} placeholder="VER OFERTA" />
          </div>
        </div>
        <div>
          <label className={labelClass}>URL del botón</label>
          <input {...register('ctaUrl')} className={inputClass} placeholder="/catalogo?oferta=true" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fecha inicio *</label>
            <input type="date" {...register('startDate')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha fin *</label>
            <input type="date" {...register('endDate')} className={inputClass} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label className="text-sm text-gray-700">Promoción activa</label>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}
