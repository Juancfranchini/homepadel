'use client';

import { X, Star, ImageIcon } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  images: string[];
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  categoryId?: string;
  brandId?: string;
  description?: string;
}

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: Props) {
  const imageSrc = getImageUrl(product.images?.[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 bg-white border border-gray-200 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Detalle del producto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex gap-0 p-6">
          <div className="flex-shrink-0 w-[200px]">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-[200px] object-contain rounded-xl bg-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-[200px] rounded-xl bg-gray-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
            )}
          </div>
          <div className="mx-4 w-px bg-gray-200 self-stretch my-2" />
          <div className="flex-1 grid grid-cols-3 gap-4 content-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{product.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">SKU</p>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 mt-1 inline-block">{product.sku || '-'}</code>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Marca</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{product.brand?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{product.category?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Precio</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(product.price)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Precio Oferta</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{product.salePrice && product.salePrice < product.price ? formatPrice(product.salePrice) : '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</p>
              <p className={'text-sm font-semibold mt-1 ' + (product.stock <= 5 ? 'text-red-500' : 'text-gray-900')}>{product.stock}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</p>
              <span className={'inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ' + (product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{product.active ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Destacado</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className={'w-4 h-4 ' + (product.featured ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-300')} />
                <span className={'text-xs font-medium ' + (product.featured ? 'text-[#C8FF00]' : 'text-gray-400')}>{product.featured ? 'Destacado' : 'No destacado'}</span>
              </div>
            </div>
            {product.description && (
              <div className="col-span-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Descripcion</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
