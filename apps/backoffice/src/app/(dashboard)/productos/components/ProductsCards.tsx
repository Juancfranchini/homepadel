import { Edit2, Trash2, ImageIcon, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Toggle from '../../testimonios/components/Toggle';
import { Product } from '../useProductosPage';
import { getImageUrl } from './ProductsTable';

export default function ProductsCards({ products, onToggleFeatured, onToggleActive, onEdit, onDelete }: {
  products: Product[]; onToggleFeatured: (p: Product) => void; onToggleActive: (p: Product) => void;
  onEdit: (p: Product) => void; onDelete: (p: Product) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {products.map((p) => {
        const imgSrc = getImageUrl(p.images?.[0]);
        return (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {imgSrc ? (
                  <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.category?.name || '-'}</p>
              </div>
              <div className="shrink-0">
                <Toggle checked={p.active} onChange={() => onToggleActive(p)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-400">Precio</p>
                <p className="font-semibold text-gray-900">{formatPrice(p.price)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Precio Promo</p>
                {p.salePrice && p.salePrice < p.price ? <p className="font-semibold text-green-600">{formatPrice(p.salePrice)}</p> : <p className="text-gray-400">-</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400">Transf./Dep.</p>
                {p.transferPrice && p.transferPrice > 0 ? <p className="font-semibold text-blue-600">{formatPrice(p.transferPrice)}</p> : <p className="text-gray-400">-</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400">Stock</p>
                <p className={'font-semibold ' + (p.stock <= 5 ? 'text-red-500' : 'text-gray-900')}>{p.stock}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button onClick={() => onToggleFeatured(p)} className="focus:outline-none" title={p.featured ? 'Quitar destacado' : 'Destacar'}>
                <Star className={'w-6 h-6 ' + (p.featured ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-300')} />
              </button>
              <div className="flex gap-2">
                <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(p)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
