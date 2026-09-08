import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  product: Product;
  isMadeToOrder: boolean;
  hasDiscount: boolean;
  adding: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
}

export default function ProductCardContent({ product, isMadeToOrder, hasDiscount, adding, onAddToCart }: Props) {
  return (
    <div className="flex flex-col flex-1 p-4 gap-2">
      {product.brand && (
        <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase tracking-widest truncate">
          {product.brand.name}
        </p>
      )}

      <Link href={'/producto/' + product.slug}>
        <h3 className="font-bold text-sm text-white leading-snug line-clamp-2 hover:text-[#B7D31A] transition-colors">
          {product.name}
        </h3>
      </Link>

      <div className="flex items-end gap-2 mt-auto pt-1">
        {hasDiscount && !isMadeToOrder ? (
          <>
            <span className="text-lg font-black text-white">{formatPrice(product.salePrice!)}</span>
            <span className="text-sm text-[#A1A1AA] line-through">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
        )}
      </div>

      {!isMadeToOrder && (
        <p className="text-[10px] font-semibold text-[#B7D31A]">
          {product.installments || 6} x {formatPrice(Math.ceil((product.salePrice && product.salePrice > 0 ? product.salePrice : product.price) / (product.installments || 6)))} sin interes
        </p>
      )}

      {!isMadeToOrder && product.stock > 0 && product.stock <= 5 && (
        <p className="text-[10px] text-orange-400 font-semibold">Solo quedan {product.stock}!</p>
      )}

      {isMadeToOrder && product.estimatedDays && (
        <p className="text-[10px] font-semibold text-[#B7D31A]">
          Fabricacion: {product.estimatedDays} días
        </p>
      )}

      <button
        onClick={onAddToCart}
        disabled={(!isMadeToOrder && product.stock === 0) || adding}
        className={'mt-1.5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wide transition-all duration-200 ' +
          ((!isMadeToOrder && product.stock === 0)
            ? 'bg-white/[0.04] text-white/20 cursor-not-allowed'
            : adding
            ? 'bg-[#B7D31A] text-[#050606] btn-primary-glow scale-95 px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider'
            : 'bg-[#B7D31A] text-[#050606] btn-primary-glow hover:bg-[#CAE52E] active:scale-95')}
      >
        <ShoppingCart size={13} />
        {(!isMadeToOrder && product.stock === 0) ? 'SIN STOCK' : adding ? '¡AGREGADO!' : 'AGREGAR AL CARRITO'}
      </button>
    </div>
  );
}
