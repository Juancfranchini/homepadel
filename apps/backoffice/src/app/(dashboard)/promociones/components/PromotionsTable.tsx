import { Edit2, Trash2 } from 'lucide-react';
import Toggle from '../../testimonios/components/Toggle';
import { Promotion } from '../usePromociones';

export default function PromotionsTable({ promotions, onToggleActive, onEdit, onDelete }: {
  promotions: Promotion[]; onToggleActive: (p: Promotion) => void; onEdit: (p: Promotion) => void; onDelete: (p: Promotion) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descuento</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vigencia</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
          </tr></thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-gray-900 font-medium text-sm">{p.title}</p>
                  {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                </td>
                <td className="px-4 py-3 text-center"><span className="text-sm font-bold text-green-600">{p.discount}% OFF</span></td>
                <td className="px-4 py-3 text-center text-xs text-gray-500 whitespace-nowrap">{new Date(p.startDate).toLocaleDateString('es-AR')} - {new Date(p.endDate).toLocaleDateString('es-AR')}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Toggle checked={p.active} onChange={() => onToggleActive(p)} />
                    <span className={'text-xs font-medium ' + (p.active ? 'text-green-600' : 'text-gray-400')}>{p.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
