import { Save } from 'lucide-react';

export default function SaveActions({ mode, saving, onCancel }: { mode: 'create' | 'edit'; saving: boolean; onCancel: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
        <Save className="w-4 h-4" />
        {saving ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
      </button>
      <button type="button" onClick={onCancel} className="btn-secondary w-full justify-center">Cancelar</button>
    </div>
  );
}
