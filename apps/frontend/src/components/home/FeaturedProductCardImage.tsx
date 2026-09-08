import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  product: Product;
  hasDiscount: boolean;
  discountPct: number;
  wished: boolean;
  onWish: (e: React.MouseEvent) => void;
}

export default function FeaturedProductCardImage({ product, hasDiscount, discountPct, wished, onWish }: Props) {
  return (
    <div className="relative aspect-square bg-[#050606] overflow-hidden">
      {product.images && product.images.length > 0 ? (
        <img
          src={getImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#050606]">
          <span className="text-3xl font-bold text-white/5">{product.name.slice(0, 2).toUpperCase()}</span>
        </div>
      )}

      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discountPct}%</span>
        )}
        {product.isNew && !hasDiscount && (
          <span className="bg-[#B7D31A] text-[#050606] text-xs font-bold px-2.5 py-1 rounded-full">NUEVO</span>
        )}
        {product.isOffer && !hasDiscount && (
          <span className="bg-white text-[#050606] text-xs font-bold px-2.5 py-1 rounded-full">OFERTA</span>
        )}
      </div>

      <button
        onClick={onWish}
        className={'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-200 ' +
          (wished ? 'bg-[#B7D31A] text-[#050606]' : 'bg-black/40 text-[#B7D31A] border border-[#B7D31A]/50 hover:bg-[#B7D31A] hover:text-[#050606]')}
        aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
