import { Edit2, Trash2, ArrowRight } from 'lucide-react';
import Toggle from './Toggle';
import StarRating from './StarRating';
import { Testimonial, formatDate } from '../useTestimonios';

export default function TestimoniosCards({ testimonials, onToggleActive, onEdit, onDelete, onDetail }: {
  testimonials: Testimonial[]; onToggleActive: (t: Testimonial) => void; onEdit: (t: Testimonial) => void;
  onDelete: (t: Testimonial) => void; onDetail: (t: Testimonial) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {testimonials.map((t) => (
        <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {t.photo ? (
                <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center">
                  <span className="text-[#C8FF00] font-bold text-xs">{t.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="text-gray-900 font-medium text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">#{t.order}</p>
              </div>
            </div>
            <Toggle checked={t.active} onChange={() => onToggleActive(t)} />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-600 text-sm italic">{'"' + t.comment + '"'}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-gray-400">Puntuacion</p>
              <div className="mt-0.5"><StarRating rating={t.rating} /></div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estado</p>
              <p className={'text-sm font-medium ' + (t.active ? 'text-green-600' : 'text-gray-400')}>{t.active ? 'Activo' : 'Inactivo'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Creado</p>
              <p className="text-sm text-gray-900">{formatDate(t.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Modificado</p>
              <p className="text-sm text-gray-900">{formatDate(t.updatedAt)}</p>
            </div>
          </div>
          <div className="border-t pt-2 flex justify-end gap-2">
            <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => onDelete(t)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            <button onClick={() => onDetail(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
