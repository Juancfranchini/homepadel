import { Edit2, Trash2, ImageIcon, Youtube, BarChart3, ListChecks } from 'lucide-react';
import { Product } from '../useProductosContenido';
import { getImageUrl } from './ContentTable';

export default function ContentCards({ products, onEdit, onDelete }: {
  products: Product[]; onEdit: (p: Product) => void; onDelete: (p: Product) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {products.map((p) => {
        const imgSrc = getImageUrl(p.images?.[0]);
        return (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex gap-3 items-stretch">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden self-center">
                {imgSrc ? <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  <div className="flex flex-col items-center gap-0.5 py-1 rounded bg-gray-50">
                    <Youtube className={'w-3.5 h-3.5 ' + (p.videoUrl ? 'text-green-500' : 'text-gray-300')} />
                    <span className="text-[9px] text-gray-500">Video</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 py-1 rounded bg-gray-50">
                    <BarChart3 className={'w-3.5 h-3.5 ' + (p.performanceStats?.length ? 'text-blue-500' : 'text-gray-300')} />
                    <span className="text-[9px] text-gray-500">Rend.</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 py-1 rounded bg-gray-50">
                    <ListChecks className={'w-3.5 h-3.5 ' + (p.highlights?.length ? 'text-amber-500' : 'text-gray-300')} />
                    <span className="text-[9px] text-gray-500">High.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(p)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
