'use client';

import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import TemplateModal from './TemplateModal';

interface PlantillasTabProps {
  templates: any[];
  selectedTemplate: any;
  setSelectedTemplate: (tpl: any) => void;
  templateModal: boolean;
  setTemplateModal: (open: boolean) => void;
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export default function PlantillasTab({ templates, selectedTemplate, setSelectedTemplate, templateModal, setTemplateModal, onCreate, onUpdate, onDelete }: PlantillasTabProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" />Plantillas de Email</h2>
        <button onClick={() => { setSelectedTemplate(null); setTemplateModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] whitespace-nowrap shrink-0">
          <Plus className="w-4 h-4" />Nueva plantilla
        </button>
      </div>
      <div className="space-y-2">
        {templates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hay plantillas creadas</p>
        ) : (
          templates.map((tpl) => (
            <div key={tpl.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{tpl.name}</p>
                <p className="text-xs text-gray-400">Asunto: {tpl.subject}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedTemplate(tpl); setTemplateModal(true); }} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => onDelete(tpl.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {templateModal && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => { setTemplateModal(false); setSelectedTemplate(null); }}
          onSave={async (data) => {
            if (selectedTemplate) {
              await onUpdate(selectedTemplate.id, data);
            } else {
              await onCreate(data);
            }
          }}
        />
      )}
    </div>
  );
}