import { createElement } from 'react';
import { Edit2, Trash2, Star } from 'lucide-react';
import Toggle from '../../testimonios/components/Toggle';
import { Benefit, ICON_MAP } from '../useBeneficios';

export default function BeneficiosCards({ benefits, onToggleActive, onEdit, onDelete }: {
  benefits: Benefit[]; onToggleActive: (b: Benefit) => void; onEdit: (b: Benefit) => void; onDelete: (b: Benefit) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {benefits.map((b) => {
        const IconComp = ICON_MAP[b.icon] || Star;
        return (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
                  {createElement(IconComp, { size: 18, className: 'text-[#C8FF00]' })}
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm">{b.title}</p>
                  <p className="text-xs text-gray-400">#{b.order}</p>
                </div>
              </div>
              <Toggle checked={b.active} onChange={() => onToggleActive(b)} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-gray-400">Descripcion</p>
                <p className="text-sm text-gray-900">{b.description || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estado</p>
                <p className={'text-sm font-medium ' + (b.active ? 'text-green-600' : 'text-gray-400')}>{b.active ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>
            <div className="border-t pt-2 flex justify-end gap-2">
              <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(b)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
