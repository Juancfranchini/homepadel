'use client';
// ProductCard — tarjeta de producto reutilizable
// Muestra imagen, badge de descuento, ícono wishlist, precios, cuotas y botón de carrito
// Props: product (Product) + onAddToCart callback

import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent, getImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? getDiscountPercent(product.price, product.salePrice!)
    : 0;

  // Genera iniciales del nombre para el placeholder de imagen
  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleAddToCart = async () => {
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-100 group">
      {/* ── Imagen ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Placeholder cuando no hay imagen */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-3xl font-black text-gray-400">{initials}</span>
          </div>
        )}

        {/* Badge de descuento — arriba a la izquierda */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-[#e53e3e] text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
            -{discountPct}%
          </span>
        )}

        {/* Botón wishlist — arriba a la derecha */}
        <button
          onClick={() => setWished(!wished)}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-200 ${
            wished
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
          } shadow-sm`}
          aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Info del producto ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Marca */}
        {product.brand && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {product.brand.name}
          </p>
        )}

        {/* Nombre */}
        <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Precios */}
        <div className="flex items-end gap-2 mt-auto">
          {hasDiscount ? (
            <>
              <span className="text-lg font-black text-gray-900">
                {formatPrice(product.salePrice!)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-black text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Cuotas — siempre muestra 6 cuotas sin interés */}
        <p className="text-xs font-semibold text-green-600">
          6 x {formatPrice(Math.ceil((product.salePrice ?? product.price) / 6))} sin interés
        </p>

        {/* Stock bajo */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-500 font-medium">
            ¡Solo quedan {product.stock}!
          </p>
        )}

        {/* Botón agregar al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : adding
              ? 'bg-[#C8FF00] text-[#111] scale-95'
              : 'bg-[#111] text-white hover:bg-[#222] active:scale-95'
          }`}
        >
          <ShoppingCart size={15} />
          {product.stock === 0
            ? 'SIN STOCK'
            : adding
            ? '¡AGREGADO!'
            : 'AGREGAR AL CARRITO'}
        </button>
      </div>
    </div>
  );
}
