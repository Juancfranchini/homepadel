import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent, getImageUrl } from '@/lib/utils';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function CatalogList({ products, onAddToCart }: Props) {
  return (
    <div className="space-y-3">
      {products.map((product) => {
        const hasDiscount = product.salePrice !== undefined && product.salePrice > 0 && product.salePrice < product.price;
        const discountPct = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;
        const displayPrice = hasDiscount ? product.salePrice! : product.price;
        const imageUrl = product.images?.length > 0 ? getImageUrl(product.images[0]) : null;

        return (
          <div key={product.id} className="bg-[#0C0C0C] rounded-2xl border border-[#B7D31A]/20 hover:border-[#B7D31A]/60 hover:shadow-2xl hover:shadow-[#B7D31A]/10 transition-all duration-300 overflow-hidden">
            <div className="flex gap-4 p-4">
              {/* Imagen */}
              <Link href={'/producto/' + product.slug} className="w-24 h-24 flex-shrink-0 bg-[#050606] rounded-xl overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8A8A85] text-lg font-bold">
                    {product.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#8A8A85] font-semibold uppercase tracking-wider">{product.brand?.name}</p>
                <Link href={'/producto/' + product.slug} className="text-[#F7F6F7] font-semibold text-sm hover:text-[#B7D31A] transition-colors line-clamp-2">
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-[#F7F6F7]">{formatPrice(displayPrice)}</span>
                  {hasDiscount && (
                    <span className="text-xs text-[#8A8A85] line-through">{formatPrice(product.price)}</span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-red-400">-{discountPct}%</span>
                  )}
                </div>
                {displayPrice >= 10000 && (
                  <p className="text-xs text-[#C7C7C0] mt-0.5">Hasta 9 cuotas sin interes</p>
                )}
              </div>

              {/* Boton */}
              <div className="flex items-center">
                <button
                  onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
                  disabled={product.stock === 0}
                  className="px-6 py-2.5 bg-[#B7D31A] text-[#050606] rounded-lg font-semibold text-xs uppercase tracking-wider btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {product.stock === 0 ? 'Sin stock' : 'AGREGAR'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}