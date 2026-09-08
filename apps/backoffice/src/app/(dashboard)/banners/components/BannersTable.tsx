import { Edit2, Trash2, ImageIcon, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/components/ui/ImageUpload';
import Toggle from '../../testimonios/components/Toggle';
import { Banner } from '../useBanners';

export default function BannersTable({ banners, onToggleActive, onEdit, onDelete }: {
  banners: Banner[]; onToggleActive: (b: Banner) => void; onEdit: (b: Banner) => void; onDelete: (b: Banner) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtitulo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => {
              const imgSrc = getImageUrl(b.image);
              return (
                <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-400">{b.order}</td>
                  <td className="px-4 py-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt={b.title} className="w-24 h-12 object-cover rounded border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-24 h-12 rounded bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm whitespace-nowrap">{b.title}</p></td>
                  <td className="px-4 py-3"><p className="text-gray-500 text-sm truncate max-w-xs">{b.subtitle || '-'}</p></td>
                  <td className="px-4 py-3">
                    {b.link ? (
                      <a href={b.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap">
                        <ExternalLink className="w-3 h-3 shrink-0" />{b.link.length > 30 ? b.link.slice(0, 30) + '...' : b.link}
                      </a>
                    ) : <span className="text-gray-400 text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Toggle checked={b.active} onChange={() => onToggleActive(b)} />
                      <span className={'text-xs font-medium ' + (b.active ? 'text-green-600' : 'text-gray-400')}>{b.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(b)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
