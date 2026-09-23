import Link from 'next/link';
import { ShoppingCart, Diamond, Droplet, Circle } from 'lucide-react';
import { Product } from '@/types';
import ProductCardPricing from './ProductCardPricing';

const SHAPE_ICONS: Record<string, typeof Diamond> = { Diamante: Diamond, Lagrima: Droplet, Redondo: Circle };

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

      {product.shape && SHAPE_ICONS[product.shape] && (() => { const ShapeIcon = SHAPE_ICONS[product.shape!]; return (<p className="flex items-center gap-1 text-[13px] text-[#A1A1AA]"><ShapeIcon size={13} />Formato: {product.shape}</p>); })()}

      <ProductCardPricing product={product} isMadeToOrder={isMadeToOrder} hasDiscount={hasDiscount} />

      {!isMadeToOrder && product.stock > 0 && product.stock <= 5 && (
        <p className="text-[10px] text-orange-400 font-semibold">Solo quedan {product.stock}!</p>
      )}

      {/* `&&` con un número imprime el número cuando vale 0: con
          `estimatedDays` en 0 la tarjeta mostraba un "0" suelto. */}
      {isMadeToOrder && (
        <p className="text-[10px] font-semibold text-[#B7D31A]">
          {product.estimatedDays && product.estimatedDays > 0
            ? `Se encarga: llega en unos ${product.estimatedDays} días`
            : 'Se encarga: llega entre 7 y 14 días'}
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
