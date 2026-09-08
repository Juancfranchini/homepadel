import { Modal } from '@/components/ui/Modal';
import StarRating from './StarRating';
import { Testimonial, formatDate } from '../useTestimonios';

export default function TestimonialDetailModal({ item, onClose }: { item: Testimonial | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <Modal isOpen={!!item} onClose={onClose} title="Detalle del testimonio" size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {item.photo ? (
            <img src={item.photo} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#C8FF00]/30" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#C8FF00]/10 border-2 border-[#C8FF00]/30 flex items-center justify-center">
              <span className="text-[#C8FF00] font-bold text-sm">{item.name.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="text-gray-900 font-semibold text-sm">{item.name}</p>
            <div className="mt-0.5"><StarRating rating={item.rating} /></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm leading-relaxed italic">{'"' + item.comment + '"'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-400">Orden</p>
            <p className="text-gray-900 text-sm">{item.order}</p>
          </div>
          <div>
            <p className="text-gray-400">Estado</p>
            <p className={'text-sm font-medium ' + (item.active ? 'text-green-600' : 'text-gray-400')}>{item.active ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div>
            <p className="text-gray-400">Creado</p>
            <p className="text-gray-900 text-sm">{formatDate(item.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-400">Modificado</p>
            <p className="text-gray-900 text-sm">{formatDate(item.updatedAt)}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
