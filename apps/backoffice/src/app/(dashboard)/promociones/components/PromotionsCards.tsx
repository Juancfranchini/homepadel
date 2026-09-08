import { Edit2, Trash2 } from 'lucide-react';
import Toggle from '../../testimonios/components/Toggle';
import { Promotion } from '../usePromociones';

export default function PromotionsCards({ promotions, onToggleActive, onEdit, onDelete }: {
  promotions: Promotion[]; onToggleActive: (p: Promotion) => void; onEdit: (p: Promotion) => void; onDelete: (p: Promotion) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {promotions.map((p) => (
        <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
              {p.description && <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>}
            </div>
            <span className="text-sm font-bold text-green-600 whitespace-nowrap shrink-0">{p.discount}% OFF</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <span className="whitespace-nowrap">{new Date(p.startDate).toLocaleDateString('es-AR')} - {new Date(p.endDate).toLocaleDateString('es-AR')}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Toggle checked={p.active} onChange={() => onToggleActive(p)} />
              <span className={'text-xs font-medium ' + (p.active ? 'text-green-600' : 'text-gray-400')}>{p.active ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(p)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
