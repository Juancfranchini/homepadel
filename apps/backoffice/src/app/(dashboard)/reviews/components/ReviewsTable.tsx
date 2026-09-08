import { Edit2, Trash2, Star, User, ArrowUpDown } from 'lucide-react';
import Toggle from '../../testimonios/components/Toggle';
import { Review } from '../useReviews';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewsTable({ reviews, sortField, onSort, onToggleActive, onEdit, onDelete }: {
  reviews: Review[]; sortField: string; onSort: (f: string) => void; onToggleActive: (r: Review) => void;
  onEdit: (r: Review) => void; onDelete: (r: Review) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Punt. <ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === 'rating' ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => onSort('rating')} />
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comentario</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
          </tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900">{r.product?.name || r.productId}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-3.5 h-3.5 text-gray-400" /></div><span className="text-sm font-medium text-gray-900">{r.name}</span></div></td>
                <td className="px-4 py-3 text-center"><div className="flex gap-0.5 justify-center">{STARS.map((s) => (<Star key={s} className={'w-3 h-3 ' + (s <= r.rating ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200')} />))}</div></td>
                <td className="px-4 py-3"><p className="text-sm text-gray-500 truncate max-w-xs">{r.comment}</p></td>
                <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-2"><Toggle checked={r.active} onChange={() => onToggleActive(r)} /><span className={'text-xs font-medium ' + (r.active ? 'text-green-600' : 'text-gray-400')}>{r.active ? 'Activo' : 'Inactivo'}</span></div></td>
                <td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={() => onEdit(r)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button><button onClick={() => onDelete(r)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
