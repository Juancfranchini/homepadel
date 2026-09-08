import { Modal } from '@/components/ui/Modal';
import { Testimonial } from '../useTestimonios';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function TestimonialFormModal({ isOpen, editItem, register, errors, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: Testimonial | null; register: any; errors: any; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar testimonio' : 'Nuevo testimonio'} size="sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input {...register('name')} className={inputClass} placeholder="Ej: Martin R." />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comentario *</label>
          <textarea {...register('comment')} rows={4} className={inputClass} placeholder="Excelente producto..." />
          {errors.comment && <p className="text-xs text-red-600 mt-1">{errors.comment.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Puntuacion</label>
          <select {...register('rating')} className={inputClass + ' pr-10'}>
            {[5, 4, 3, 2, 1].map(r => (<option key={r} value={r}>{r} estrella{r > 1 ? 's' : ''}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
          <input {...register('photo')} className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
          <input type="number" min={0} {...register('order')} className={inputClass} />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="tActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label htmlFor="tActive" className="text-sm text-gray-700">Visible en el sitio</label>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
            {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
