import { Edit2, Trash2, ArrowRight, ImageIcon, Star, ArrowUpDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Toggle from '../../testimonios/components/Toggle';
import { Product } from '../useProductosPage';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

function SortableHeader({ label, field, sortField, onSort }: { label: string; field: string; sortField: string; onSort: (f: string) => void }) {
  return (
    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">
      <span className="inline-flex items-center gap-1 cursor-pointer" onClick={() => onSort(field)}>
        {label} <ArrowUpDown className={'w-3 h-3 inline-block ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} />
      </span>
    </th>
  );
}

export default function ProductsTable({ products, sortField, onSort, onToggleFeatured, onToggleActive, onEdit, onDelete, onDetail }: {
  products: Product[]; sortField: string; onSort: (f: string) => void; onToggleFeatured: (p: Product) => void;
  onToggleActive: (p: Product) => void; onEdit: (p: Product) => void; onDelete: (p: Product) => void; onDetail: (p: Product) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Imagen</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">
                <span className="inline-flex items-center gap-1 cursor-pointer" onClick={() => onSort('name')}>Nombre <ArrowUpDown className={'w-3 h-3 inline-block ' + (sortField === 'name' ? 'text-[#C8FF00]' : 'text-gray-400')} /></span>
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
              <SortableHeader label="Precio" field="price" sortField={sortField} onSort={onSort} />
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Promo</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Transf.</th>
              <SortableHeader label="Stock" field="stock" sortField={sortField} onSort={onSort} />
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Destacado</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Activo</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const imgSrc = getImageUrl(p.images?.[0]);
              return (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                    )}
                  </td>
                  <td className="px-3 py-3"><p className="text-gray-900 font-medium text-sm">{p.name}</p></td>
                  <td className="px-3 py-3 text-sm text-gray-500">{p.category?.name || '-'}</td>
                  <td className="px-3 py-3 text-center font-semibold text-sm">{formatPrice(p.price)}</td>
                  <td className="px-3 py-3 text-center">
                    {p.salePrice && p.salePrice < p.price ? <p className="text-green-600 font-semibold text-sm">{formatPrice(p.salePrice)}</p> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {p.transferPrice && p.transferPrice > 0 ? <p className="text-blue-600 font-semibold text-sm">{formatPrice(p.transferPrice)}</p> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-3 py-3 text-center"><span className={'text-sm font-medium ' + (p.stock <= 5 ? 'text-red-500' : 'text-gray-700')}>{p.stock}</span></td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => onToggleFeatured(p)} className="focus:outline-none" title={p.featured ? 'Quitar destacado' : 'Destacar'}>
                      <Star className={'w-5 h-5 ' + (p.featured ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-300')} />
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center"><Toggle checked={p.active} onChange={() => onToggleActive(p)} /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => onDetail(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
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

export { getImageUrl };
