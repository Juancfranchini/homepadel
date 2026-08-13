'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900';

interface TemplateModalProps {
  template: any;
  onClose: () => void;
  onSave: (data: { name: string; subject: string; content: string }) => void;
}

export default function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [content, setContent] = useState(template?.content || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name || !subject || !content) return;
    setSaving(true);
    try {
      await onSave({ name, subject, content });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{template ? 'Editar plantilla' : 'Nueva plantilla'}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la plantilla *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ej: Novedades de verano" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Asunto del email *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="Ej: Novedades Home Padel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contenido del email *</label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || !name || !subject || !content} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
}