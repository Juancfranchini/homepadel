import { createElement } from 'react';
import { Plus, Edit2, Trash2, MessageCircle, Mail, Clock, MapPin } from 'lucide-react';

const ICON_MAP: Record<string, any> = { MessageCircle, Mail, Clock, MapPin };

export default function ContactCardsSection({ visible, fields, onAdd, onEdit, onRemove }: {
  visible: boolean; fields: { id: string }[]; onAdd: () => void; onEdit: (i: number) => void; onRemove: (i: number) => void;
}) {
  if (!visible) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Informacion de Contacto</h3>
        <button type="button" onClick={onAdd}
          className="flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00] whitespace-nowrap">
          <Plus size={12} />Agregar Card
        </button>
      </div>
      <div className="p-4 sm:p-6 space-y-3">
        {fields.map((field, i) => {
          const card = field as any;
          const IconComp = ICON_MAP[card.icon] || MessageCircle;
          return (
            <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (card.bgColor || '#8A8A85') + '20' }}>
                    {createElement(IconComp, { size: 18, style: { color: card.bgColor || '#8A8A85' } })}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{card.title || 'Sin titulo'}</p>
                    <p className="text-xs text-gray-400">{card.desc || ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => onEdit(i)} className="p-1.5 text-[#C8FF00] hover:bg-[#C8FF00]/10 rounded-lg"><Edit2 size={14} /></button>
                  <button type="button" onClick={() => onRemove(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {fields.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No hay cards. Agrega una con el boton superior.</p>}
      </div>
    </div>
  );
}
