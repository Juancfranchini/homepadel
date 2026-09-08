import { Plus, Edit2, Trash2, MessageCircle } from 'lucide-react';
import Toggle from '../../testimonios/components/Toggle';

export default function ChannelsSection({ channels, active, onToggleActive, onAdd, onEdit, onDelete }: {
  channels: any[]; active: boolean; onToggleActive: () => void; onAdd: () => void; onEdit: (c: any) => void; onDelete: (c: any) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Canales de Contacto</h3>
          <p className="text-xs text-gray-400 mt-0.5">{channels.length} canales configurados</p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle checked={active} onChange={onToggleActive} />
          <button type="button" onClick={onAdd}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00] whitespace-nowrap">
            <Plus size={12} />Agregar Canal
          </button>
        </div>
      </div>
      {active && (
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {channels.map((channel) => (
              <div key={channel.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#0f172a] flex items-center justify-center overflow-hidden">
                    {channel.logo ? <img src={channel.logo} alt={channel.title} className="w-full h-full object-cover" /> : <MessageCircle size={20} className="text-[#C8FF00]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{channel.title || 'Sin titulo'}</p>
                    <p className="text-xs text-gray-400 truncate">{channel.description || channel.desc || ''}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-1">
                  <button type="button" onClick={() => onEdit(channel)} className="p-1.5 text-[#C8FF00] hover:bg-[#C8FF00]/10 rounded-lg"><Edit2 size={14} /></button>
                  <button type="button" onClick={() => onDelete(channel)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
