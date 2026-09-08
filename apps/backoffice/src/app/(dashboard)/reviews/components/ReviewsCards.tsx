import { Edit2, Trash2, Star } from 'lucide-react';
import Toggle from '../../testimonios/components/Toggle';
import { Review } from '../useReviews';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewsCards({ reviews, onToggleActive, onEdit, onDelete }: {
  reviews: Review[]; onToggleActive: (r: Review) => void; onEdit: (r: Review) => void; onDelete: (r: Review) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{r.product?.name || r.productId}</p>
              <p className="text-xs text-gray-400">{r.name}</p>
            </div>
            <div className="flex gap-0.5 shrink-0">{STARS.map((s) => (<Star key={s} className={'w-3 h-3 ' + (s <= r.rating ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200')} />))}</div>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2">{r.comment}</p>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Toggle checked={r.active} onChange={() => onToggleActive(r)} />
              <span className={'text-xs ' + (r.active ? 'text-green-600' : 'text-gray-400')}>{r.active ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(r)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(r)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
