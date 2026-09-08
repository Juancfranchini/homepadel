import { createElement } from 'react';
import { Edit2, Trash2, Star } from 'lucide-react';
import Toggle from '../../testimonios/components/Toggle';
import { Benefit, ICON_MAP } from '../useBeneficios';

export default function BeneficiosTable({ benefits, onToggleActive, onEdit, onDelete }: {
  benefits: Benefit[]; onToggleActive: (b: Benefit) => void; onEdit: (b: Benefit) => void; onDelete: (b: Benefit) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Icono</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripcion</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {benefits.map((b) => {
            const IconComp = ICON_MAP[b.icon] || Star;
            return (
              <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-center text-sm text-gray-400">{b.order}</td>
                <td className="px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center">
                    {createElement(IconComp, { size: 16, className: 'text-[#C8FF00]' })}
                  </div>
                </td>
                <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{b.title}</p></td>
                <td className="px-4 py-3"><p className="text-gray-500 text-sm">{b.description || '-'}</p></td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Toggle checked={b.active} onChange={() => onToggleActive(b)} />
                    <span className={'text-xs font-medium ' + (b.active ? 'text-green-600' : 'text-gray-400')}>{b.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(b)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
