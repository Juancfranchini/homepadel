'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getDiscountPercent, getImageUrl } from '@/lib/utils';

interface Props {
  products: Product[];
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0 || adding) return;
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 900);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWished(!wished);
  };

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group block"
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-3xl font-black text-gray-300">
              {product.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-[#e53e3e] text-white text-xs font-black px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.isNew && !hasDiscount && (
            <span className="bg-[#111] text-[#C8FF00] text-xs font-black px-2 py-0.5 rounded-full">
              NUEVO
            </span>
          )}
          {product.isOffer && !hasDiscount && (
            <span className="bg-[#C8FF00] text-[#111] text-xs font-black px-2 py-0.5 rounded-full">
              OFERTA
            </span>
          )}
        </div>

        <button
          onClick={handleWish}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm transition-all duration-200 ${
            wished ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-400 hover:bg-white'
          }`}
          aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        {product.brand && (
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            {product.brand.name}
          </p>
        )}

        <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-1">
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

        {/* Cuotas */}
        {product.price >= 10000 && (
          <p className="text-xs text-green-600 font-medium">
            Hasta 9 cuotas sin interés
          </p>
        )}

        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || adding}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wide transition-all duration-200 ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : adding
              ? 'bg-[#C8FF00] text-[#111] scale-95'
              : 'bg-[#111] text-white hover:bg-[#333]'
          }`}
        >
          <ShoppingCart size={13} />
          {product.stock === 0 ? 'Sin stock' : adding ? '¡Agregado! ✓' : 'Agregar al carrito'}
        </button>
      </div>
    </Link>
  );
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Vertex 04 2025', slug: 'vertex-04-2025', price: 374999, salePrice: 299999, sku: 'BUL-001', stock: 8, images: [], featured: true, isNew: false, isOffer: false, description: '', category: { id: '1', name: 'Paletas', slug: 'paletas' }, brand: { id: '1', name: 'Bullpadel', slug: 'bullpadel' } },
  { id: '2', name: 'Metalbone HRD 3.4', slug: 'metalbone-hrd-3-4', price: 349999, salePrice: 279999, sku: 'ADI-001', stock: 12, images: [], featured: true, isNew: true, isOffer: false, description: '', category: { id: '1', name: 'Paletas', slug: 'paletas' }, brand: { id: '2', name: 'Adidas', slug: 'adidas' } },
  { id: '3', name: 'Air Viper 2025', slug: 'air-viper-2025', price: 339999, salePrice: 269999, sku: 'BAB-001', stock: 6, images: [], featured: true, isNew: false, isOffer: true, description: '', category: { id: '1', name: 'Paletas', slug: 'paletas' }, brand: { id: '3', name: 'Babolat', slug: 'babolat' } },
  { id: '4', name: 'AT10 Genius 18K', slug: 'at10-genius-18k', price: 359999, salePrice: 289999, sku: 'NOX-001', stock: 4, images: [], featured: true, isNew: false, isOffer: false, description: '', category: { id: '1', name: 'Paletas', slug: 'paletas' }, brand: { id: '4', name: 'Nox', slug: 'nox' } },
];

export default function FeaturedProducts({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  const displayProducts = products && products.length > 0 ? products : MOCK_PRODUCTS;

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#111]">
              Las más vendidas del mes
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">Elegidas por nuestra comunidad.</p>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-bold text-[#C8FF00] hover:text-[#111] transition-colors flex items-center gap-1"
          >
            VER TODOS
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Carrusel con flechas */}
        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 bg-[#111] rounded-full flex items-center justify-center text-white hover:bg-[#333] transition-colors shadow-lg hidden md:flex"
            aria-label="Ver anteriores"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4L7 9l5 5"/>
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
          >
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="flex-none w-60 md:w-64"
                style={{ scrollSnapAlign: 'start' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 bg-[#111] rounded-full flex items-center justify-center text-white hover:bg-[#333] transition-colors shadow-lg hidden md:flex"
            aria-label="Ver más"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
