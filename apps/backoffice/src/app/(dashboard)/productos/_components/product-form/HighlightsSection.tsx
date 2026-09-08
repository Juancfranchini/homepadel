import { Plus, Trash2, List } from 'lucide-react';
import { SectionCard } from './shared';

export default function HighlightsSection({ highlightsWatch, newHighlight, setNewHighlight, setValue }: {
  highlightsWatch: string[]; newHighlight: string; setNewHighlight: (v: string) => void; setValue: any;
}) {
  const addHighlight = () => {
    const text = newHighlight.trim();
    if (!text) return;
    setValue('highlights', [...highlightsWatch, text]);
    setNewHighlight('');
  };

  return (
    <SectionCard icon={<List className="w-4 h-4" />} title="Destacados del producto">
      <p className="text-xs text-gray-500 -mt-2 mb-2">
        Bullets que aparecen en la sección &quot;DESTACADOS&quot; del detalle del producto. Cada producto puede tener los suyos.
      </p>
      <div className="space-y-2">
        {highlightsWatch.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => {
                const updated = [...highlightsWatch];
                updated[idx] = e.target.value;
                setValue('highlights', updated);
              }}
              className="input-field flex-1 text-sm"
              placeholder="Ej: Producto original con garantía oficial"
            />
            <button type="button" onClick={() => setValue('highlights', highlightsWatch.filter((_, i) => i !== idx))} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newHighlight}
          onChange={(e) => setNewHighlight(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
          className="input-field flex-1 text-sm"
          placeholder="Escribí un destacado y presioná Enter o +"
        />
        <button type="button" onClick={addHighlight} className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </SectionCard>
  );
}
