import { Modal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function ChannelFormModal({ isOpen, isEdit, channelForm, setChannelForm, onClose, onSave }: {
  isOpen: boolean; isEdit: boolean; channelForm: any; setChannelForm: (f: any) => void; onClose: () => void; onSave: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Canal' : 'Agregar Canal'} size="lg">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="md:w-1/3 space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo del Canal</h4>
            <ImageUpload value={channelForm.logo} onChange={(url) => setChannelForm({ ...channelForm, logo: url })} placeholder="URL o subir logo" width={200} height={100} />
          </div>
          <div className="hidden md:block w-px bg-gray-200 self-stretch" />
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Titulo *</label>
              <input value={channelForm.title} onChange={(e) => setChannelForm({ ...channelForm, title: e.target.value })} className={inputClass} placeholder="WhatsApp" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion</label>
              <input value={channelForm.description} onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })} className={inputClass} placeholder="La forma mas rapida de contactarnos." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">URL *</label>
              <input value={channelForm.url} onChange={(e) => setChannelForm({ ...channelForm, url: e.target.value })} className={inputClass} placeholder="https://wa.me/..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Texto del boton</label>
              <input value={channelForm.buttonText} onChange={(e) => setChannelForm({ ...channelForm, buttonText: e.target.value })} className={inputClass} placeholder="Ir a WhatsApp" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
          <button onClick={onSave} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold">Guardar</button>
        </div>
      </div>
    </Modal>
  );
}
