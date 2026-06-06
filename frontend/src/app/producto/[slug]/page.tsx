'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Heart, ShoppingCart, Truck,
  RefreshCw, Shield, Minus, Plus, Star, ChevronDown,
  MessageCircle, MapPin, Check, Play, Zap,
} from 'lucide-react';
import { getProduct, getFeaturedProducts } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

// ─── TIPOS INTERNOS ───────────────────────────────────────────────────────────

interface PerformanceStat { label: string; value: number; }
interface Feature { icon: string; title: string; subtitle: string; }
interface CompetitorRow { label: string; values: (number | string)[]; }
interface Review { name: string; avatar: string; rating: number; comment: string; date: string; verified: boolean; }
interface FaqItem { q: string; a: string; }

// ─── DATOS ESTÁTICOS DE ENRIQUECIMIENTO ──────────────────────────────────────

const DEFAULT_PERFORMANCE: PerformanceStat[] = [
  { label: 'CONTROL',       value: 95 },
  { label: 'POTENCIA',      value: 75 },
  { label: 'SALIDA DE BOLA',value: 90 },
  { label: 'MANEJABILIDAD', value: 92 },
  { label: 'DUREZA',        value: 70 },
  { label: 'JUGABILIDAD',   value: 96 },
];

const DEFAULT_FEATURES: Feature[] = [
  { icon: '⬡', title: 'Carbono 18K',      subtitle: 'Máxima resistencia y durabilidad' },
  { icon: '◯', title: 'Forma Redonda',    subtitle: 'Mayor punto dulce y control' },
  { icon: '⚖', title: 'Balance Medio',   subtitle: 'Equilibrio perfecto entre control y potencia' },
  { icon: '⚡', title: 'Peso 360-375g',  subtitle: 'Peso ideal para máximo rendimiento' },
  { icon: '🎯', title: 'Jugador Avanzado',subtitle: 'Diseñado para jugadores exigentes' },
  { icon: '✦',  title: 'Control Superior',subtitle: 'Tecnología enfocada en el control total' },
];

const DEFAULT_COMPETITORS = ['Metalbone HRD 3.3', 'Adipower Ctrl 3.3', 'Cross It Light 3.3'];
const COMPETITOR_ROWS: CompetitorRow[] = [
  { label: 'Control',      values: [5, 4, 4, 3] },
  { label: 'Potencia',     values: [4, 5, 3, 5] },
  { label: 'Salida de bola',values: [5, 4, 4, 4] },
  { label: 'Manejabilidad',values: [4, 4, 4, 4] },
  { label: 'Balance',      values: ['Medio', 'Alto', 'Medio', 'Bajo'] },
  { label: 'Nivel',        values: ['Inter - Avz', 'Avanzado', 'Inter - Avz', 'Intermedio'] },
];

const DEFAULT_REVIEWS: Review[] = [
  { name: 'Martín Guevara', avatar: 'MG', rating: 5, comment: 'Excelente control y salida de bola. La mejor pala que tuve hasta ahora.', date: 'Hace 2 días', verified: true },
  { name: 'Pablo S.',       avatar: 'PS', rating: 5, comment: 'Me llegó en 2 días y en perfecto estado. La pala es una locura, súper recomendable.', date: 'Hace 1 semana', verified: true },
  { name: 'Jorge L.',       avatar: 'JL', rating: 5, comment: 'Gran equilibrio entre control y potencia. Ideal para mi estilo de juego.', date: 'Hace 2 semanas', verified: true },
  { name: 'Eduardo P.',     avatar: 'EP', rating: 5, comment: 'Terminaciones premium y sensación increíble en cada golpe.', date: 'Hace 3 semanas', verified: true },
];

const DEFAULT_FAQ: FaqItem[] = [
  { q: '¿Es original y tiene garantía oficial?', a: 'Sí, todos nuestros productos son 100% originales con garantía oficial del fabricante.' },
  { q: '¿Cuánto tarda en llegar?', a: 'El envío estándar demora entre 3 y 5 días hábiles. Ofrecemos envío express en 24-48 hs.' },
  { q: '¿Puedo cambiarla si no me convence?', a: 'Sí, aceptamos cambios dentro de los 30 días desde la compra, siempre que el producto esté sin uso.' },
  { q: '¿Qué nivel de juego requiere esta pala?', a: 'Está diseñada para jugadores de nivel intermedio-avanzado que buscan control y precisión.' },
  { q: '¿Tienen stock permanente?', a: 'Manejamos stock limitado de los modelos más populares. Te recomendamos no demorar la compra.' },
];

// ─── SUBCOMPONENTES ───────────────────────────────────────────────────────────

function StarBar({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) =>
        typeof rating === 'number' ? (
          <Star key={i} size={13} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
        ) : null
      )}
    </div>
  );
}

function PerformanceBar({ label, value }: PerformanceStat) {
  return (
    <div className="flex items-center gap-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] w-28 flex-none">{label}</p>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#D4FF00] rounded-full transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[#D4FF00] font-black text-xs w-8 text-right">{value}%</span>
    </div>
  );
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-white/[0.08] rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-semibold text-sm hover:bg-white/[0.03] transition-colors"
          >
            {item.q}
            <ChevronDown size={16} className={`flex-none text-[#A1A1AA] transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-[#A1A1AA] text-sm leading-relaxed border-t border-white/[0.06]">
              <p className="pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function ProductoPage() {
  const params  = useParams<{ slug: string }>();
  const router  = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product,  setProduct]  = useState<Product | null>(null);
  const [related,  setRelated]  = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selImg,   setSelImg]   = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wished,   setWished]   = useState(false);
  const [added,    setAdded]    = useState(false);
  const [postal,   setPostal]   = useState('');
  const relScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);
    Promise.allSettled([
      getProduct(params.slug),
      getFeaturedProducts(),
    ]).then(([prodRes, relRes]) => {
      const p = prodRes.status === 'fulfilled' ? (prodRes.value?.data ?? prodRes.value) : null;
      setProduct(p ?? MOCK_PRODUCT);
      if (relRes.status === 'fulfilled') {
        const all: Product[] = Array.isArray(relRes.value) ? relRes.value : (relRes.value as { data?: Product[] })?.data ?? [];
        setRelated(all.filter((x) => x.slug !== params.slug).slice(0, 6));
      }
    }).finally(() => setLoading(false));
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

  // ── Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-white/[0.04] rounded-2xl" />
          <div className="space-y-4">
            <div className="h-3 bg-white/[0.06] rounded w-1/4" />
            <div className="h-8 bg-white/[0.06] rounded w-3/4" />
            <div className="h-12 bg-white/[0.06] rounded w-1/2" />
            <div className="h-24 bg-white/[0.06] rounded" />
            <div className="h-12 bg-white/[0.08] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A1A1AA] mb-4">Producto no encontrado</p>
          <Link href="/catalogo" className="text-[#D4FF00] font-bold underline">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const hasDiscount  = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct  = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;
  const displayPrice = product.salePrice ?? product.price;
  const images       = product.images.length > 0 ? product.images : ['', '', '', ''];
  const cuota        = Math.ceil(displayPrice / 9);
  const transferPrice = Math.ceil(displayPrice * 0.8);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* ══ BREADCRUMB ═══════════════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
          <span>/</span>
          <Link href={`/catalogo?marca=${product.brand.slug}`} className="hover:text-white transition-colors">{product.brand.name}</Link>
          <span>/</span>
          <span className="text-white truncate">{product.name}</span>
        </div>
      </div>

      {/* ══ HERO — GALERÍA + INFO ═════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">

          {/* ── GALERÍA ────────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            {/* Miniaturas verticales */}
            <div className="flex flex-col gap-2 w-[60px] flex-none">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelImg(i)}
                  className={`w-[60px] h-[60px] rounded-lg overflow-hidden border transition-all ${
                    selImg === i
                      ? 'border-[#D4FF00] shadow-[0_0_12px_rgba(212,255,0,0.25)]'
                      : 'border-white/[0.08] hover:border-white/25'
                  } bg-[#121212]`}
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/20">
                      {i + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Imagen principal */}
            <div className="flex-1 aspect-square bg-[#121212] rounded-2xl border border-white/[0.08] overflow-hidden relative group">
              {images[selImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(images[selImg])}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <span className="text-6xl font-black text-white/[0.06]">
                    {product.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                  </span>
                  <span className="text-xs text-white/20 text-center px-8">{product.name}</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="bg-[#e53e3e] text-white text-xs font-black px-3 py-1 rounded-full">
                    -{discountPct}%
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-[#D4FF00] text-[#111] text-xs font-black px-3 py-1 rounded-full">
                    NUEVO
                  </span>
                )}
              </div>

              {/* Nav flechas */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelImg((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setSelImg((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── INFO DEL PRODUCTO ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Marca */}
            <Link
              href={`/catalogo?marca=${product.brand.slug}`}
              className="text-[#D4FF00] text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
            >
              {product.brand.name}
            </Link>

            {/* Nombre */}
            <h1 className="text-2xl md:text-3xl xl:text-4xl font-black text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-white font-bold text-sm">4.9</span>
              <span className="text-[#A1A1AA] text-xs">(29 reseñas verificadas)</span>
            </div>

            {/* Precios */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black text-white">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-[#A1A1AA] line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {/* Descuento transferencia */}
              <p className="text-[#D4FF00] text-sm font-semibold">
                {formatPrice(transferPrice)} con transferencia
              </p>
              {/* Cuotas */}
              <div className="flex items-center gap-1.5 text-[#A1A1AA] text-sm">
                <span className="text-white font-bold">9 cuotas sin interés</span>
                <span>de {formatPrice(cuota)}</span>
              </div>
            </div>

            {/* Stock urgency */}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="inline-flex items-center gap-2 bg-[#e53e3e]/10 border border-[#e53e3e]/30 text-[#e53e3e] text-xs font-black px-3 py-2 rounded-lg w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e53e3e] animate-pulse flex-none" />
                ¡ÚLTIMAS {product.stock} UNIDADES!
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08]">
              {[
                { icon: <Shield size={16} />, text: 'Garantía Oficial' },
                { icon: <Truck size={16} />, text: 'Envíos a todo el país' },
                { icon: <RefreshCw size={16} />, text: 'Cambios gratuitos' },
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[#D4FF00]">{t.icon}</span>
                  <span className="text-[10px] text-[#A1A1AA] leading-snug">{t.text}</span>
                </div>
              ))}
            </div>

            {/* Cantidad */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#A1A1AA]">Cantidad:</span>
              <div className="flex items-center bg-[#121212] border border-white/[0.08] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/[0.06] transition-colors disabled:opacity-30"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center font-black text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={quantity >= (product.stock || 99)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/[0.06] transition-colors disabled:opacity-30"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              {/* Comprar ahora */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full py-4 rounded-xl bg-[#D4FF00] text-[#111] font-black text-sm uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                COMPRAR AHORA
              </button>

              {/* Agregar al carrito + Favoritos */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-black text-sm uppercase tracking-wider transition-all duration-200 ${
                    product.stock === 0
                      ? 'border-white/[0.08] text-white/20 cursor-not-allowed'
                      : added
                      ? 'border-[#D4FF00] bg-[#D4FF00]/10 text-[#D4FF00]'
                      : 'border-white/20 text-white hover:border-white/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <ShoppingCart size={16} />
                  {product.stock === 0 ? 'Sin stock' : added ? '¡Agregado!' : 'AGREGAR AL CARRITO'}
                </button>
                <button
                  onClick={() => setWished(!wished)}
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                    wished ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/20 text-[#A1A1AA] hover:border-red-400 hover:text-red-400'
                  }`}
                  aria-label="Favoritos"
                >
                  <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5491172345678?text=Hola! Me interesa este producto"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl border border-green-500/30 text-green-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-500/[0.08] transition-colors"
              >
                <MessageCircle size={16} />
                Consultar por WhatsApp
              </a>
            </div>

            {/* Calculadora de envío */}
            <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-[#D4FF00]" />
                <p className="text-sm font-bold text-white">Calculá tu envío</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="Ingresá tu código postal"
                  className="flex-1 bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4FF00]/50"
                />
                <button className="px-4 py-2 bg-[#D4FF00] text-[#111] rounded-lg text-xs font-black uppercase tracking-wide hover:bg-white transition-colors">
                  Calcular
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-2 flex items-center gap-1">
                <Shield size={10} className="text-[#D4FF00]" />
                Compra protegida · Datos 100% seguros
              </p>
            </div>

            {/* SKU */}
            <p className="text-[10px] text-white/20">SKU: {product.sku}</p>
          </div>
        </div>
      </div>

      {/* ══ PERFORMANCE ══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
              RENDIMIENTO DE UN VISTAZO
            </h2>
            <p className="text-[#A1A1AA] text-sm mt-1">
              Ideal para jugadores de nivel:{' '}
              <span className="text-[#D4FF00] font-bold">INTERMEDIO - AVANZADO</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_PERFORMANCE.map((s) => (
              <PerformanceBar key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CARACTERÍSTICAS PRINCIPALES ══════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
            CARACTERÍSTICAS PRINCIPALES
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {DEFAULT_FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-[#121212] border border-white/[0.08] rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:border-[#D4FF00]/30 transition-colors"
              >
                <span className="text-2xl">{f.icon}</span>
                <p className="text-white font-black text-xs uppercase tracking-wide leading-snug">{f.title}</p>
                <p className="text-[#A1A1AA] text-[10px] leading-snug">{f.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DESCRIPCIÓN + VIDEO ═══════════════════════════════════════════════ */}
      {product.description && (
        <section className="border-t border-white/[0.06] py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Video placeholder */}
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6">
                  VIDEO DEL PRODUCTO
                </h2>
                <div className="aspect-video bg-[#121212] border border-white/[0.08] rounded-2xl overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#D4FF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={24} className="text-[#111] ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-[#A1A1AA] text-xs">0:00 / 1:06</div>
                </div>
              </div>

              {/* Por qué elegir */}
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6">
                  ¿POR QUÉ ELEGIR ESTA PALA?
                </h2>
                <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">{product.description}</p>
                <ul className="space-y-2.5">
                  {[
                    'Carbono 18K aluminizado para mayor resistencia y potencia controlada',
                    'EVA Soft Performance para una excelente salida de bola',
                    'Spin Blade Decal para mejorar los efectos en cada golpe',
                    'Dynamic Air Flow para mayor aerodinámica y manejabilidad',
                    'Smart Holes Curve que optimiza el punto dulce',
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                      <span className="w-4 h-4 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center flex-none mt-0.5">
                        <Check size={10} className="text-[#D4FF00]" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ TABLA COMPARATIVA ════════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
            COMPARÁ CON OTROS MODELOS
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 pr-4 text-[#A1A1AA] font-semibold text-xs uppercase tracking-wider w-36">
                    Característica
                  </th>
                  <th className="py-3 px-3 text-center">
                    <span className="bg-[#D4FF00] text-[#111] text-xs font-black px-2 py-1 rounded-full whitespace-nowrap">
                      {product.name.split(' ').slice(0, 3).join(' ')}
                    </span>
                  </th>
                  {DEFAULT_COMPETITORS.map((c) => (
                    <th key={c} className="py-3 px-3 text-center text-white/60 text-xs font-semibold whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_ROWS.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 text-[#A1A1AA] text-xs font-semibold">{row.label}</td>
                    {row.values.map((v, vi) => (
                      <td key={vi} className={`py-3 px-3 text-center ${vi === 0 ? 'bg-[#D4FF00]/[0.04]' : ''}`}>
                        {typeof v === 'number' ? (
                          <div className="flex justify-center">
                            <StarBar rating={v} />
                          </div>
                        ) : (
                          <span className={`text-xs font-semibold ${vi === 0 ? 'text-[#D4FF00]' : 'text-[#A1A1AA]'}`}>{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ RESEÑAS ══════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                LO QUE DICEN NUESTROS CLIENTES
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-[#A1A1AA] text-xs">4.9 · 29 reseñas verificadas</span>
              </div>
            </div>
            <button className="text-xs text-[#D4FF00] font-bold hover:opacity-80 flex items-center gap-1">
              Ver todas las 29 reseñas <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_REVIEWS.map((rev, i) => (
              <div key={i} className="bg-[#121212] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20 flex items-center justify-center flex-none">
                    <span className="text-[#D4FF00] font-black text-xs">{rev.avatar}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{rev.name}</p>
                    {rev.verified && (
                      <div className="flex items-center gap-1 text-[10px] text-green-400">
                        <Check size={10} /> Comprador verificado
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: rev.rating }).map((_, j) => (
                    <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[#A1A1AA] text-xs leading-relaxed flex-1">{rev.comment}</p>
                <p className="text-white/20 text-[10px]">{rev.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUCTOS RELACIONADOS ════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
              PRODUCTOS RELACIONADOS
            </h2>
            <div className="relative">
              <button
                onClick={() => relScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#121212] border border-white/[0.08] flex items-center justify-center text-white hover:border-white/20 transition-colors hidden md:flex"
              >
                <ChevronLeft size={14} />
              </button>
              <div
                ref={relScrollRef}
                className="flex gap-4 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
              >
                {related.map((p) => {
                  const relDiscount = p.salePrice && p.salePrice < p.price;
                  return (
                    <Link
                      key={p.id}
                      href={`/producto/${p.slug}`}
                      className="flex-none w-52 bg-[#121212] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/20 transition-all group"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="aspect-square bg-[#0A0A0A] overflow-hidden">
                        {p.images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageUrl(p.images[0])}
                            alt={p.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-black text-white/[0.06]">
                              {p.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase tracking-wider">{p.brand?.name}</p>
                        <p className="text-white text-xs font-bold leading-snug mt-0.5 line-clamp-2">{p.name}</p>
                        <p className="text-white font-black text-sm mt-1.5">
                          {formatPrice(p.salePrice ?? p.price)}
                          {relDiscount && (
                            <span className="text-[#A1A1AA] text-[10px] font-normal line-through ml-1.5">
                              {formatPrice(p.price)}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={() => relScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#121212] border border-white/[0.08] flex items-center justify-center text-white hover:border-white/20 transition-colors hidden md:flex"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══ FAQ ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
            PREGUNTAS FRECUENTES
          </h2>
          <FaqAccordion items={DEFAULT_FAQ} />
        </div>
      </section>

      {/* ══ TRUST BOTTOM ═════════════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: <Truck size={22} />,      title: 'ENVÍOS A TODO EL PAÍS',    sub: 'Recibí tu pedido en cualquier punto del país' },
              { icon: <RefreshCw size={22} />,   title: '30 DÍAS PARA CAMBIOS',     sub: 'Si no estás conforme, podés cambiar tu producto' },
              { icon: <Shield size={22} />,      title: 'GARANTÍA OFICIAL',         sub: 'Todos nuestros productos cuentan con garantía oficial' },
              { icon: <Check size={22} />,       title: 'PAGOS 100% SEGUROS',       sub: 'Protegemos tus datos con el más alto nivel de seguridad' },
              { icon: <MessageCircle size={22} />,title: 'ATENCIÓN PERSONALIZADA', sub: 'Te asesoramos por WhatsApp en todo momento' },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 p-3">
                <span className="text-[#D4FF00]">{t.icon}</span>
                <p className="text-white font-black text-[11px] uppercase tracking-wide leading-snug">{t.title}</p>
                <p className="text-[#A1A1AA] text-[10px] leading-snug">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// ─── MOCK DE FALLBACK ─────────────────────────────────────────────────────────
const MOCK_PRODUCT: Product = {
  id: '1',
  name: 'Adidas Metalbone Ctrl 3.5 2026',
  slug: 'adidas-metalbone-ctrl-3-5-2026',
  description: 'La Metalbone Ctrl 3.5 es la elección perfecta para jugadores que buscan el máximo control sin resignar potencia. Su forma redonda, balance medio y tecnologías de última generación ofrecen una experiencia de juego superior.',
  price: 800000,
  salePrice: undefined,
  sku: 'ADI-MB-CTRL-3526',
  stock: 3,
  images: [],
  featured: true,
  isNew: true,
  isOffer: false,
  category: { id: '1', name: 'Paletas', slug: 'paletas' },
  brand:    { id: '1', name: 'Adidas',  slug: 'adidas' },
};
