import { Edit2, Trash2, ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/components/ui/ImageUpload';
import Toggle from '../../testimonios/components/Toggle';
import { Category } from '../useCategorias';

export default function CategoriasCards({ categories, onToggleActive, onEdit, onDelete }: {
  categories: Category[]; onToggleActive: (c: Category) => void; onEdit: (c: Category) => void; onDelete: (c: Category) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {categories.map((cat) => {
        const imgSrc = getImageUrl(cat.image);
        return (
          <div key={cat.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {imgSrc ? (
                  <img src={imgSrc} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat._count?.products ?? 0} productos</p>
              </div>
              <div className="shrink-0">
                <Toggle checked={cat.active} onChange={() => onToggleActive(cat)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => onEdit(cat)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(cat)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
