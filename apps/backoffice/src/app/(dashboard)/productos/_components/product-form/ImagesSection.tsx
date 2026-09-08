import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { SectionCard, Label } from './shared';

export default function ImagesSection({ imagesWatch, newImageUrl, setNewImageUrl, onAdd, onRemove }: {
  imagesWatch: string[]; newImageUrl: string; setNewImageUrl: (v: string) => void; onAdd: () => void; onRemove: (idx: number) => void;
}) {
  return (
    <SectionCard icon={<ImageIcon className="w-4 h-4" />} title="Imágenes del producto">
      <div>
        <Label>Agregar imagen por URL</Label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
            className="input-field"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <button type="button" onClick={onAdd} className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Presioná Enter o el botón + para agregar. La primera imagen es la principal.</p>
      </div>

      {imagesWatch.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
          {imagesWatch.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={url}
                alt={`imagen ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-[#C8FF00] text-[#0f172a] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Principal</span>
              )}
              <button type="button" onClick={() => onRemove(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Sin imágenes todavía. Pegá una URL arriba para agregar.</p>
        </div>
      )}
    </SectionCard>
  );
}
