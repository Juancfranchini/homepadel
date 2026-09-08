import { ArrowLeft, Save } from 'lucide-react';

export default function FormTopBar({ mode, saving, onBack }: { mode: 'create' | 'edit'; saving: boolean; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Nuevo producto' : 'Editar producto'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mode === 'create' ? 'Completá los datos del nuevo producto' : 'Modificá los datos del producto'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
