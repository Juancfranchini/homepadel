'use client';
// Página de detalle de producto
// Galería de imágenes, información completa, selector de cantidad y botón de carrito
// Metadata dinámica para SEO generada por el server component padre

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Heart,
  ShoppingCart,
  Truck,
  RefreshCw,
  Shield,
  Minus,
  Plus,
} from 'lucide-react';
import { getProduct } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

export default function ProductoPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);
    getProduct(params.slug)
      .then((data) => {
        const p = data?.data ?? data;
        setProduct(p ?? MOCK_PRODUCT);
      })
      .catch(() => setProduct(MOCK_PRODUCT))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    router.push('/carrito');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Producto no encontrado</p>
        <Link href="/catalogo" className="text-[#111] font-bold underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;
  const displayPrice = product.salePrice ?? product.price;

  // Genera array de imágenes (o placeholders)
  const images = product.images.length > 0
    ? product.images
    : ['', '', '', ''];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">Inicio</Link>
            <span>/</span>
            <Link href="/catalogo" className="hover:text-gray-600">Catálogo</Link>
            <span>/</span>
            <Link
              href={`/catalogo?categoria=${product.category.slug}`}
              className="hover:text-gray-600"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#111] mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Galería de imágenes ─────────────────────────────────── */}
          <div className="flex gap-3">
            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-16">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-[#C8FF00]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(img)}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs text-gray-400 font-bold">
                        {i + 1}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Imagen principal */}
            <div className="flex-1 aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden relative">
              {images[selectedImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-5xl font-black text-gray-300">
                    {product.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                  </span>
                  <span className="text-xs text-gray-400">{product.name}</span>
                </div>
              )}

              {/* Badge de descuento */}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#e53e3e] text-white text-sm font-black px-3 py-1 rounded-full">
                  -{discountPct}%
                </span>
              )}
            </div>
          </div>

          {/* ── Información del producto ────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Marca */}
            <Link
              href={`/catalogo?marca=${product.brand.slug}`}
              className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[#111] transition-colors"
            >
              {product.brand.name}
            </Link>

            {/* Nombre */}
            <h1 className="text-3xl md:text-4xl font-black text-[#111] leading-tight">
              {product.name}
            </h1>

            {/* SKU */}
            <p className="text-xs text-gray-400">SKU: {product.sku}</p>

            {/* Precios */}
            <div className="flex items-end gap-4">
              <span className="text-4xl font-black text-[#111]">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <div className="flex flex-col">
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-[#e53e3e] font-bold">
                    Ahorrás {formatPrice(product.price - product.salePrice!)}
                  </span>
                </div>
              )}
            </div>

            {/* Cuotas */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-green-700 font-bold text-sm">
                6 x {formatPrice(Math.ceil(displayPrice / 6))} sin interés
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                Con todas las tarjetas de crédito
              </p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  product.stock > 5
                    ? 'bg-green-500'
                    : product.stock > 0
                    ? 'bg-orange-400'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-600">
                {product.stock > 5
                  ? 'En stock'
                  : product.stock > 0
                  ? `¡Solo quedan ${product.stock}!`
                  : 'Sin stock'}
              </span>
            </div>

            {/* Selector de cantidad */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 ${
                  product.stock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : added
                    ? 'bg-[#C8FF00] text-[#111]'
                    : 'bg-[#111] text-white hover:bg-[#222] active:scale-95'
                }`}
              >
                <ShoppingCart size={18} />
                {product.stock === 0 ? 'Sin stock' : added ? '¡Agregado!' : 'Agregar al carrito'}
              </button>

              <button
                onClick={() => setWished(!wished)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  wished
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-400'
                }`}
                aria-label="Agregar a favoritos"
              >
                <Heart size={20} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Comprar ahora */}
            {product.stock > 0 && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl border-2 border-[#111] text-[#111] font-black text-sm uppercase tracking-wider hover:bg-[#111] hover:text-white transition-colors duration-200"
              >
                Comprar ahora
              </button>
            )}

            {/* Garantías */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
              <div className="flex flex-col items-center gap-1 text-center">
                <Truck size={20} className="text-gray-500" />
                <p className="text-xs text-gray-500">Envío gratis +$100k</p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <RefreshCw size={20} className="text-gray-500" />
                <p className="text-xs text-gray-500">Cambios 15 días</p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Shield size={20} className="text-gray-500" />
                <p className="text-xs text-gray-500">Compra segura</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Descripción ─────────────────────────────────────────── */}
        {product.description && (
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">
              Descripción
            </h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Producto mock de fallback
const MOCK_PRODUCT: Product = {
  id: '1',
  name: 'Paleta Babolat Viper Carbon Pro',
  slug: 'paleta-babolat-viper-carbon-pro',
  description:
    'La paleta Babolat Viper Carbon Pro es una de las más avanzadas del mercado. Fabricada con fibra de carbono de alta densidad, ofrece un control excepcional y una potencia inigualable. Ideal para jugadores avanzados que buscan el máximo rendimiento en cancha.',
  price: 85000,
  salePrice: 68000,
  sku: 'BAB-VCP-001',
  stock: 8,
  images: [],
  featured: true,
  category: { id: '1', name: 'Paletas', slug: 'paletas' },
  brand: { id: '1', name: 'Babolat', slug: 'babolat' },
};
