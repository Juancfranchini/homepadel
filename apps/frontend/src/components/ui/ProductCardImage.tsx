import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  product: Product;
  initials: string;
  hasDiscount: boolean;
  discountPct: number;
  isMadeToOrder: boolean;
  wished: boolean;
  onToggleWish: (e: React.MouseEvent) => void;
}

export default function ProductCardImage({ product, initials, hasDiscount, discountPct, isMadeToOrder, wished, onToggleWish }: Props) {
  return (
    <Link href={'/producto/' + product.slug} className="relative aspect-square bg-[#050606] overflow-hidden block flex-none">
      {product.images && product.images.length > 0 ? (
        <img
          src={getImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-4xl font-black text-white/[0.06]">{initials}</span>
        </div>
      )}

      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
        {hasDiscount && !isMadeToOrder && (
          <span className="bg-[#e53e3e] text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none">
            -{discountPct}%
          </span>
        )}
        {isMadeToOrder && (
          <span className="bg-[#B7D31A] text-[#050606] btn-primary-glow text-xs font-bold px-2.5 py-1 rounded-full">
            POR ENCARGO
          </span>
        )}
        {product.isNew && !isMadeToOrder && (
          <span className="bg-[#B7D31A] text-[#050606] btn-primary-glow text-xs font-bold px-2.5 py-1 rounded-full">
            NUEVO
          </span>
        )}
        {product.isOffer && !hasDiscount && !isMadeToOrder && (
          <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none">
            OFERTA
          </span>
        )}
      </div>

      <button
        onClick={onToggleWish}
        className={'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ' +
          (wished
            ? 'bg-red-500 text-white'
            : 'bg-black/40 text-[#B7D31A] border border-[#B7D31A]/50 hover:bg-[#B7D31A] hover:text-[#050606]')}
        aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart size={13} fill={wished ? 'currentColor' : 'none'} />
      </button>
    </Link>
  );
}
