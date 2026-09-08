import { Modal } from '@/components/ui/Modal';
import { MessageCircle, Mail, Clock, MapPin } from 'lucide-react';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

const ICON_OPTIONS = [
  { value: 'MessageCircle', label: 'WhatsApp', icon: MessageCircle },
  { value: 'Mail', label: 'Email', icon: Mail },
  { value: 'Clock', label: 'Horarios', icon: Clock },
  { value: 'MapPin', label: 'Ubicacion', icon: MapPin },
];

export default function CardFormModal({ isOpen, isEdit, cardForm, setCardForm, onClose, onSave }: {
  isOpen: boolean; isEdit: boolean; cardForm: any; setCardForm: (f: any) => void; onClose: () => void; onSave: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Card' : 'Agregar Card'} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Titulo *</label>
          <input value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} className={inputClass} placeholder="WhatsApp" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion</label>
            <input value={cardForm.desc} onChange={(e) => setCardForm({ ...cardForm, desc: e.target.value })} className={inputClass} placeholder="La forma mas rapida." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Detalle</label>
            <input value={cardForm.detail} onChange={(e) => setCardForm({ ...cardForm, detail: e.target.value })} className={inputClass} placeholder="11 3181-3297" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Link (opcional)</label>
            <input value={cardForm.href} onChange={(e) => setCardForm({ ...cardForm, href: e.target.value })} className={inputClass} placeholder="https://wa.me/..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
            <input type="color" value={cardForm.bgColor} onChange={(e) => setCardForm({ ...cardForm, bgColor: e.target.value })} className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Icono</label>
          <select value={cardForm.icon} onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })} className={inputClass}>
            {ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
          <button onClick={onSave} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold">Guardar</button>
        </div>
      </div>
    </Modal>
  );
}
