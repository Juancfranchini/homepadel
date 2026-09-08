import { Edit2, Trash2, ArrowRight, ImageIcon, Youtube, BarChart3, ListChecks } from 'lucide-react';
import { Product } from '../useProductosContenido';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

export default function ContentTable({ products, onEdit, onDelete, onDetail }: {
  products: Product[]; onEdit: (p: Product) => void; onDelete: (p: Product) => void; onDetail: (p: Product) => void;
}) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Imagen</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Video</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rendimiento</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Highlights</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const imgSrc = getImageUrl(p.images?.[0]);
              return (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{imgSrc ? <img src={imgSrc} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>}</td>
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{p.name}</p></td>
                  <td className="px-4 py-3 text-center">{p.videoUrl ? <Youtube className="w-4 h-4 text-green-500 mx-auto" /> : '-'}</td>
                  <td className="px-4 py-3 text-center">{p.performanceStats?.length ? <BarChart3 className="w-4 h-4 text-blue-500 mx-auto" /> : '-'}</td>
                  <td className="px-4 py-3 text-center">{p.highlights?.length ? <ListChecks className="w-4 h-4 text-amber-500 mx-auto" /> : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => onDetail(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Detalle"><ArrowRight className="w-4 h-4" /></button>
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
