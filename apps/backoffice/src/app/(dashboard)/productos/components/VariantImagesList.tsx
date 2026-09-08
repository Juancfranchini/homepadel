import { Trash2, Upload } from 'lucide-react';

export default function VariantImagesList({ images, inputClass, uploading, onUpdate, onUpload, onRemove }: {
  images: string[]; inputClass: string; uploading: boolean;
  onUpdate: (imgIdx: number, value: string) => void; onUpload: (imgIdx: number) => void; onRemove: (imgIdx: number) => void;
}) {
  if (images.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-3">
      {images.map((img, imgIdx) => (
        <div key={imgIdx} className="flex items-center gap-1.5 w-full">
          <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-300">IMG</span>}
          </div>
          <input
            type="text"
            value={img}
            onChange={(e) => onUpdate(imgIdx, e.target.value)}
            className={inputClass + ' flex-1 min-w-0'}
            placeholder={'Imagen secundaria ' + (imgIdx + 1)}
          />
          <button type="button" onClick={() => onUpload(imgIdx)} disabled={uploading}
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-[10px] font-medium border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap">
            {uploading ? '...' : <Upload className="w-3 h-3" />}
          </button>
          <button type="button" onClick={() => onRemove(imgIdx)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
