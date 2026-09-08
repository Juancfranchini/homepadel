import { Edit2, Trash2, ImageIcon, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/components/ui/ImageUpload';
import Toggle from '../../testimonios/components/Toggle';
import { Banner } from '../useBanners';

export default function BannersCards({ banners, onToggleActive, onEdit, onDelete }: {
  banners: Banner[]; onToggleActive: (b: Banner) => void; onEdit: (b: Banner) => void; onDelete: (b: Banner) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {banners.map((b) => {
        const imgSrc = getImageUrl(b.image);
        return (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              {imgSrc ? (
                <img src={imgSrc} alt={b.title} className="w-24 h-14 rounded-lg bg-gray-100 object-cover border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-24 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon className="w-5 h-5 text-gray-400" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">#{b.order}</p>
              </div>
              <div className="shrink-0">
                <Toggle checked={b.active} onChange={() => onToggleActive(b)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-400">Subtitulo</p>
                <p className="font-medium text-gray-900">{b.subtitle || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Imagen Mobile</p>
                {b.imageMobile ? <p className="text-xs text-green-600 font-medium">Configurada</p> : <p className="text-gray-400">-</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400">Texto Boton</p>
                <p className="font-medium text-gray-900">{b.ctaText || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estado</p>
                <p className={'font-medium ' + (b.active ? 'text-green-600' : 'text-gray-400')}>{b.active ? 'Activo' : 'Inactivo'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400">Link</p>
                {b.link ? (
                  <a href={b.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{b.link}</span>
                  </a>
                ) : <p className="text-gray-400">-</p>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className={'text-xs font-medium ' + (b.active ? 'text-green-600' : 'text-gray-400')}>{b.active ? 'Activo' : 'Inactivo'}</span>
              <div className="flex gap-2">
                <button onClick={() => onEdit(b)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(b)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
