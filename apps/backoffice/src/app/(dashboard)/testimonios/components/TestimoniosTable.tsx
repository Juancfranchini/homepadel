import { Edit2, Trash2, ArrowRight, ArrowUpDown } from 'lucide-react';
import Toggle from './Toggle';
import StarRating from './StarRating';
import { Testimonial, formatDate } from '../useTestimonios';

function SortHeader({ label, field, sortField, onSort }: { label: string; field: string; sortField: string; onSort: (f: string) => void }) {
  return (
    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}<ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => onSort(field)} />
    </th>
  );
}

export default function TestimoniosTable({ testimonials, sortField, onSort, onToggleActive, onEdit, onDelete, onDetail }: {
  testimonials: Testimonial[]; sortField: string; onSort: (f: string) => void; onToggleActive: (t: Testimonial) => void;
  onEdit: (t: Testimonial) => void; onDelete: (t: Testimonial) => void; onDetail: (t: Testimonial) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">#</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comentario</th>
            <SortHeader label="Puntuacion" field="rating" sortField={sortField} onSort={onSort} />
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creado<ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === 'createdAt' ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => onSort('createdAt')} /></th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modificado<ArrowUpDown className={'w-3 h-3 ml-1 inline cursor-pointer ' + (sortField === 'updatedAt' ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => onSort('updatedAt')} /></th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map((t) => (
            <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-center text-sm text-gray-400">{t.order}</td>
              <td className="px-4 py-3">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center">
                    <span className="text-[#C8FF00] font-bold text-xs">{t.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </td>
              <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{t.name}</p></td>
              <td className="px-4 py-3"><p className="text-gray-500 text-sm max-w-xs truncate">{t.comment}</p></td>
              <td className="px-4 py-3"><div className="flex justify-center"><StarRating rating={t.rating} /></div></td>
              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(t.updatedAt)}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Toggle checked={t.active} onChange={() => onToggleActive(t)} />
                  <span className={'text-xs font-medium ' + (t.active ? 'text-green-600' : 'text-gray-400')}>{t.active ? 'Activo' : 'Inactivo'}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(t)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => onDetail(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
