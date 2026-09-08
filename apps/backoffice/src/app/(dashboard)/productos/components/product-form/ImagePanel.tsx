import { Upload, ImageIcon } from 'lucide-react';
import ImageGalleryInput from '../ImageGalleryInput';
import { labelClass } from './schema';

export default function ImagePanel({ mainImage, setMainImage, previewUrl, uploading, onUpload, galleryImages, setGalleryImages }: {
  mainImage: string; setMainImage: (v: string) => void; previewUrl: string | null; uploading: boolean; onUpload: () => void;
  galleryImages: string[]; setGalleryImages: (v: string[]) => void;
}) {
  return (
    <div className="w-full lg:w-[220px] flex-shrink-0 flex flex-col gap-3">
      <div className="w-full h-[180px] sm:h-[220px] rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-300" />
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={mainImage}
          onChange={(e) => setMainImage(e.target.value)}
          className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
          placeholder="URL de imagen"
        />
        <button type="button" onClick={onUpload} disabled={uploading} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 leading-tight">Medida recomendada: 800x800px (cuadrada). Fondo blanco. Peso maximo: 500KB.</p>
      <div className="mt-2">
        <label className={labelClass}>Imagenes secundarias</label>
        <div className="mt-1"><ImageGalleryInput images={galleryImages} onChange={setGalleryImages} /></div>
      </div>
    </div>
  );
}
