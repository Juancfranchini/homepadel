'use client';

import { Save, LayoutDashboard } from 'lucide-react';
import { SECTIONS, SectionItem, useHomeSections } from './useHomeSections';

function SectionToggleRow({ section, active, onToggle }: { section: SectionItem; active: boolean; onToggle: (checked: boolean) => void }) {
  return (
    <div className={'flex items-start gap-4 p-4 rounded-lg transition-colors ' + (active ? 'bg-gray-50' : 'bg-gray-100/50 opacity-60')}>
      <label className="flex items-center gap-3 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-4 h-4 border border-gray-300 rounded-[1px] cursor-pointer accent-[#C8FF00]"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{section.label}</p>
          <p className="text-xs text-gray-400">{section.description}</p>
        </div>
        <span className={'text-xs font-medium ' + (active ? 'text-green-600' : 'text-gray-400')}>
          {active ? 'Seccion activa' : 'Seccion inactiva'}
        </span>
      </label>
    </div>
  );
}

export default function HomeSectionsTab() {
  const { sections, loading, saving, handleToggle, handleSaveAll } = useHomeSections();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">Cargando secciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-gray-500" />
          Secciones del Home
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Activa o desactiva las secciones que se muestran en la landing page. Los cambios se aplican al instante.
        </p>

        <div className="space-y-1">
          {SECTIONS.map((section) => (
            <SectionToggleRow
              key={section.key}
              section={section}
              active={sections[section.key] !== false}
              onToggle={(checked) => handleToggle(section.key, checked)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className={'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ' +
            (!saving
              ? 'bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar todo'}
        </button>
      </div>
    </div>
  );
}
