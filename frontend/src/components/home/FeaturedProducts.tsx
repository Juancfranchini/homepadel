'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ShoppingCart, Heart } from 'lucide-react';
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
      href={'/producto/' + product.slug}
      className="group bg-[#0C0C0C] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#B7D31A]/10 border border-[#B7D31A]/20 hover:border-[#B7D31A]/60 flex flex-col"
    >
      {/* Imagen */}
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

        {/* Badges */}
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

        {/* Wishlist */}
        <button
          onClick={handleWish}
          className={'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-200 ' +
            (wished ? 'bg-[#B7D31A] text-[#050606]' : 'bg-black/40 text-[#B7D31A] border border-[#B7D31A]/50 hover:bg-[#B7D31A] hover:text-[#050606]')}
          aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        {product.brand && (
          <p className="text-xs text-[#8A8A85] font-semibold uppercase tracking-wider">{product.brand.name}</p>
        )}

        <h3 className="font-semibold text-sm text-[#F7F6F7] leading-snug line-clamp-2 uppercase">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-1">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold text-[#F7F6F7]">{formatPrice(product.salePrice!)}</span>
              <span className="text-xs text-[#8A8A85] line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-xl font-bold text-[#F7F6F7]">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Cuotas */}
        {product.price >= 10000 && (
          <p className="text-xs text-[#C7C7C0] font-medium">
            Hasta 9 cuotas sin interes
          </p>
        )}

        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || adding}
          className={'mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all duration-200 ' +
            (product.stock === 0
              ? 'bg-white/5 text-[#8A8A85] cursor-not-allowed'
              : adding
              ? 'bg-[#B7D31A] text-[#050606] scale-95'
              : 'bg-[#B7D31A] text-[#050606] hover:bg-[#CAE52E] btn-primary-glow')}
        >
          <ShoppingCart size={14} />
          {product.stock === 0 ? 'Sin stock' : adding ? 'AGREGADO' : 'COMPRAR'}
        </button>
      </div>
    </Link>
  );
}

const MOCK: Product[] = [
  { id: '1', name: 'NOX AT10 Genius WR 2024', slug: 'nox-at10-genius', price: 550000, salePrice: undefined, sku: 'N1', stock: 8, images: [], featured: true, isNew: false, isOffer: false, description: '', category: { id: '1', name: 'Paletas', slug: 'paletas' }, brand: { id: '1', name: 'NOX', slug: 'nox' } },
  { id: '2', name: 'Bullpadel Hack 04 2024', slug: 'bullpadel-hack-04', price: 525000, salePrice: 420000, sku: 'B1', stock: 12, images: [], featured: true, isNew: true, isOffer: false, description: '', category: { id: '1', name: 'Paletas', slug: 'paletas' }, brand: { id: '2', name: 'Bullpadel', slug: 'bullpadel' } },
  { id: '3', name: 'Adidas Metalbone 3.3 2025', slug: 'adidas-metalbone', price: 530000, salePrice: undefined, sku: 'A1', stock: 6, images: [], featured: true, isNew: false, isOffer: true, description: '', category: { id: '1', name: 'Paletas', slug: 'paletas' }, brand: { id: '3', name: 'Adidas', slug: 'adidas' } },
  { id: '4', name: 'Paletero NOX AT10 Team', slug: 'paletero-nox', price: 210000, salePrice: undefined, sku: 'N2', stock: 4, images: [], featured: true, isNew: false, isOffer: false, description: '', category: { id: '2', name: 'Paleteros', slug: 'paleteros' }, brand: { id: '4', name: 'NOX', slug: 'nox' } },
  { id: '5', name: 'Zapatillas Bullpadel Vertex', slug: 'zapatillas-bullpadel', price: 180000, salePrice: 135000, sku: 'B2', stock: 10, images: [], featured: true, isNew: false, isOffer: true, description: '', category: { id: '3', name: 'Zapatillas', slug: 'zapatillas' }, brand: { id: '2', name: 'Bullpadel', slug: 'bullpadel' } },
];

export default function FeaturedProducts({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayProducts = products && products.length >= 5 ? products.slice(0, 5) : MOCK;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  return (
    <section className="bg-[#050606] py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#F7F6F7]">
              LOS MAS VENDIDOS
            </h2>
            <p className="text-[#C7C7C0] text-sm mt-0.5">Elegidos por nuestra comunidad.</p>
          </div>
          <Link href="/catalogo" className="text-sm font-semibold text-[#B7D31A] hover:text-[#CAE52E] flex items-center gap-1 uppercase transition-colors">
            VER TODOS <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative">
          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 rounded-full items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 hover:border-[#B7D31A] transition-all hidden md:flex">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4l-6 6 6 6"/></svg>
          </button>

          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {displayProducts.map(p => (
              <div key={p.id} className="flex-none w-[260px] md:w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 bg-[#B7D31A]/10 backdrop-blur-sm border border-[#B7D31A]/30 rounded-full items-center justify-center text-[#B7D31A] hover:bg-[#B7D31A]/20 hover:border-[#B7D31A] transition-all hidden md:flex">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}