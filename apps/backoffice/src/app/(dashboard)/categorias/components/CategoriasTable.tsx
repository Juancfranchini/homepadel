import { Edit2, Trash2, ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/components/ui/ImageUpload';
import Toggle from '../../testimonios/components/Toggle';
import { Category } from '../useCategorias';

export default function CategoriasTable({ categories, showCategoriesSection, loadingSection, onToggleSection, onToggleActive, onEdit, onDelete }: {
  categories: Category[]; showCategoriesSection: boolean; loadingSection: boolean; onToggleSection: (checked: boolean) => void;
  onToggleActive: (c: Category) => void; onEdit: (c: Category) => void; onDelete: (c: Category) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const imgSrc = getImageUrl(cat.image);
              return (
                <tr key={cat.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{cat.name}</p></td>
                  <td className="px-4 py-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{cat.slug}</code></td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{cat._count?.products ?? '-'}</td>
                  <td className="px-4 py-3 text-center"><Toggle checked={cat.active} onChange={() => onToggleActive(cat)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(cat)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(cat)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCategoriesSection}
            onChange={(e) => onToggleSection(e.target.checked)}
            disabled={loadingSection}
            className="w-4 h-4 border border-gray-300 rounded-[1px] cursor-pointer accent-[#C8FF00]"
          />
          <span className="text-sm font-medium text-gray-700">
            {showCategoriesSection ? 'No mostrar seccion en Landing Page' : 'Mostrar seccion'}
          </span>
        </label>
      </div>
    </div>
  );
}
