import { Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Review } from '../useReviews';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';
const STARS = [1, 2, 3, 4, 5];

export default function ReviewFormModal({ isOpen, editItem, products, register, errors, watchRating, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: Review | null; products: { id: string; name: string }[]; register: any; errors: any;
  watchRating: number; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar resena' : 'Nueva resena'} size="md">
      <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-6">
        <div>
          <label className={labelClass}>Producto *</label>
          <select {...register('productId')} className={inputClass + ' mt-1'}>
            <option value="">Seleccionar</option>
            {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          {errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Nombre *</label>
          <input {...register('name')} className={inputClass + ' mt-1'} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Puntuacion *</label>
          <div className="flex items-center gap-2 mt-1">
            <input type="number" min={1} max={5} {...register('rating')} className={inputClass + ' w-20'} />
            <div className="flex gap-0.5">{STARS.map((s) => (<Star key={s} className={'w-5 h-5 ' + (s <= (watchRating || 5) ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200')} />))}</div>
          </div>
        </div>
        <div>
          <label className={labelClass}>Comentario *</label>
          <textarea {...register('comment')} rows={3} className={inputClass + ' mt-1'} />
          {errors.comment && <p className="text-xs text-red-600 mt-1">{errors.comment.message}</p>}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Aprobada</label>
          <label className="flex items-center gap-2"><input type="checkbox" {...register('verified')} className="w-4 h-4 rounded accent-[#C8FF00]" /> Verificada</label>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}
