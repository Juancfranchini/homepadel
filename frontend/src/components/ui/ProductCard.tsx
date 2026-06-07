'use client';
// ProductCard — tarjeta de producto reutilizable
// Diseño dark premium alineado con el resto de Home Pádel
// Props: product (Product) + onAddToCart callback

import { useState } from 'react';
import Link from 'next/link';
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
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;

  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col group hover:border-white/[0.16] transition-all duration-200 hover:-translate-y-0.5">

      {/* ── Imagen ─────────────────────────────────────────────────────────── */}
      <Link href={`/producto/${product.slug}`} className="relative aspect-square bg-[#0d0d0d] overflow-hidden block flex-none">
        {product.images && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
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

        {/* Badges arriba-izquierda */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="bg-[#e53e3e] text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none">
              -{discountPct}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#D4FF00] text-[#111] text-[10px] font-black px-2 py-0.5 rounded-full leading-none">
              NUEVO
            </span>
          )}
          {product.isOffer && !hasDiscount && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none">
              OFERTA
            </span>
          )}
        </div>

        {/* Wishlist arriba-derecha */}
        <button
          onClick={(e) => { e.preventDefault(); setWished(!wished); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            wished
              ? 'bg-red-500 text-white'
              : 'bg-black/50 text-white/30 hover:text-red-400 hover:bg-black/70'
          }`}
          aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart size={13} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* ── Contenido ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Marca */}
        {product.brand && (
          <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase tracking-widest truncate">
            {product.brand.name}
          </p>
        )}

        {/* Nombre */}
        <Link href={`/producto/${product.slug}`}>
          <h3 className="font-bold text-sm text-white leading-snug line-clamp-2 hover:text-[#D4FF00] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Precios */}
        <div className="flex items-end gap-2 mt-auto pt-1">
          {hasDiscount ? (
            <>
              <span className="text-lg font-black text-white">{formatPrice(product.salePrice!)}</span>
              <span className="text-sm text-[#A1A1AA] line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Cuotas */}
        <p className="text-[10px] font-semibold text-[#D4FF00]">
          6 x {formatPrice(Math.ceil((product.salePrice ?? product.price) / 6))} sin interés
        </p>

        {/* Stock bajo */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] text-orange-400 font-semibold">¡Solo quedan {product.stock}!</p>
        )}

        {/* Botón agregar al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={`mt-1.5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wide transition-all duration-200 ${
            product.stock === 0
              ? 'bg-white/[0.04] text-white/20 cursor-not-allowed'
              : adding
              ? 'bg-[#D4FF00] text-[#111] scale-95'
              : 'bg-[#D4FF00] text-[#111] hover:bg-white active:scale-95'
          }`}
        >
          <ShoppingCart size={13} />
          {product.stock === 0 ? 'SIN STOCK' : adding ? '¡AGREGADO!' : 'AGREGAR AL CARRITO'}
        </button>
      </div>
    </div>
  );
}
