'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900';

interface CampaignModalProps {
  templates: any[];
  recipients: string[];
  onClose: () => void;
  onLoadRecipients: (source: 'all' | 'customers' | 'newsletter') => void;
  onCreate: (data: { name: string; templateId: string; recipients: string[] }) => void;
}

export default function CampaignModal({ templates, recipients, onClose, onLoadRecipients, onCreate }: CampaignModalProps) {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [source, setSource] = useState<'all' | 'customers' | 'newsletter'>('all');

  const handleSourceChange = (newSource: 'all' | 'customers' | 'newsletter') => {
    setSource(newSource);
    onLoadRecipients(newSource);
  };

  const handleCreate = () => {
    onCreate({ name, templateId, recipients: selectedRecipients });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Nueva campaña</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la campaña *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ej: Novedades agosto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Plantilla *</label>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={inputClass}>
              <option value="">Seleccionar plantilla...</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{tpl.name} - {tpl.subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Destinatarios</label>
            <div className="flex gap-2 mb-3">
              {(['all', 'customers', 'newsletter'] as const).map((src) => (
                <button key={src} onClick={() => handleSourceChange(src)} className={'px-3 py-1.5 rounded-lg text-xs font-medium ' + (source === src ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {src === 'all' ? 'Todos' : src === 'customers' ? 'Clientes' : 'Newsletter'}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {recipients.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No hay destinatarios disponibles</p>
              ) : (
                recipients.map((email) => (
                  <label key={email} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(email)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRecipients(prev => [...prev, email]);
                        } else {
                          setSelectedRecipients(prev => prev.filter(r => r !== email));
                        }
                      }}
                      className="w-4 h-4 rounded accent-[#C8FF00]"
                    />
                    <span className="text-sm text-gray-700">{email}</span>
                  </label>
                ))
              )}
            </div>
            {selectedRecipients.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">{selectedRecipients.length} destinatarios seleccionados</p>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleCreate} disabled={!name || !templateId || selectedRecipients.length === 0} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50">
            <Plus className="w-4 h-4" />Crear campaña
          </button>
        </div>
      </div>
    </div>
  );
}