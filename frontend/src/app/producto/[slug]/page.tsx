'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Heart, ShoppingCart, Truck,
  RefreshCw, Shield, Minus, Plus,
  MessageCircle, MapPin, Check, Zap, X, CreditCard,
} from 'lucide-react';
import { getProduct, getFeaturedProducts } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

// ─── TIPOS INTERNOS ───────────────────────────────────────────────────────────

interface PerformanceStat { label: string; value: number; }
interface Feature { icon: string; title: string; subtitle: string; }

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Convierte una URL de YouTube o Vimeo a su URL de embed.
 * Devuelve null si la URL no es reconocida o está vacía.
 */
function getVideoEmbedUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`;
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/')) return url;
  return null;
}

// ─── SUBCOMPONENTES ───────────────────────────────────────────────────────────

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

// ─── MEDIOS DE PAGO ──────────────────────────────────────────────────────────

interface PaymentDef { label: string; group: 'credit' | 'debit' | 'transfer' | 'wallet'; color: string }

const PAYMENT_CATALOG: Record<string, PaymentDef> = {
  visa:         { label: 'Visa',            group: 'credit',   color: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  mastercard:   { label: 'Mastercard',      group: 'credit',   color: 'bg-orange-900/40 text-orange-300 border-orange-700/40' },
  amex:         { label: 'Amex',            group: 'credit',   color: 'bg-blue-900/40 text-blue-200 border-blue-700/40' },
  naranja_x:    { label: 'Naranja X',       group: 'credit',   color: 'bg-orange-900/40 text-orange-400 border-orange-700/40' },
  nativa:       { label: 'Nativa',          group: 'credit',   color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' },
  cabal:        { label: 'Cabal',           group: 'credit',   color: 'bg-red-900/40 text-red-300 border-red-700/40' },
  argencard:    { label: 'Argencard',       group: 'credit',   color: 'bg-green-900/40 text-green-300 border-green-700/40' },
  visa_deb:     { label: 'Visa Débito',     group: 'debit',    color: 'bg-blue-900/30 text-blue-300 border-blue-800/40' },
  mc_deb:       { label: 'MC Débito',       group: 'debit',    color: 'bg-orange-900/30 text-orange-300 border-orange-800/40' },
  cabal_deb:    { label: 'Cabal Débito',    group: 'debit',    color: 'bg-red-900/30 text-red-300 border-red-800/40' },
  transferencia:{ label: 'Transferencia',   group: 'transfer', color: 'bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30' },
  banelco:      { label: 'Banelco',         group: 'transfer', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40' },
  link:         { label: 'Link Pagos',      group: 'transfer', color: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40' },
  mercadopago:  { label: 'Mercado Pago',    group: 'wallet',   color: 'bg-sky-900/40 text-sky-300 border-sky-700/40' },
  cuenta_dni:   { label: 'Cuenta DNI',      group: 'wallet',   color: 'bg-slate-800 text-slate-300 border-slate-600/40' },
};

const PAYMENT_GROUP_LABELS: Record<string, string> = {
  credit:   'Tarjetas de crédito',
  debit:    'Tarjetas de débito',
  transfer: 'Transferencia o depósito',
  wallet:   'Billetera virtual',
};

interface PaymentModalProps {
  onClose: () => void;
  methods: string[];
  displayPrice: number;
  transferPrice: number;
}

function PaymentModal({ onClose, methods, displayPrice, transferPrice }: PaymentModalProps) {
  const groups = ['credit', 'debit', 'transfer', 'wallet'] as const;
  const hasTransfer = methods.some((m) => ['transferencia', 'banelco', 'link'].includes(m));
  const creditMethods = methods.filter((m) => PAYMENT_CATALOG[m]?.group === 'credit');
  const cuota3  = Math.ceil(displayPrice / 3);
  const cuota6  = Math.ceil(displayPrice / 6);
  const cuota9  = Math.ceil(displayPrice / 9);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-[#111] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#111] border-b border-white/[0.08] px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#D4FF00]" />
            <h2 className="text-white font-black text-base uppercase tracking-wide">Medios de pago</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Cuotas — solo si hay métodos de crédito */}
          {creditMethods.length > 0 && (
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4">
              <p className="text-xs text-[#A1A1AA] font-semibold uppercase tracking-wide mb-3">
                Total en 1 pago: <span className="text-white">{formatPrice(displayPrice)}</span> con todas las tarjetas
              </p>
              <p className="text-xs text-[#A1A1AA] mb-2">O pagá en cuotas sin interés:</p>
              <div className="space-y-2">
                {[
                  { n: 3, monto: cuota3 },
                  { n: 6, monto: cuota6 },
                  { n: 9, monto: cuota9 },
                ].map(({ n, monto }) => (
                  <div key={n} className="flex items-center justify-between text-sm py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-white font-semibold">{n} cuotas de {formatPrice(monto)} sin interés</span>
                    <span className="text-[#A1A1AA] text-xs">Total {formatPrice(displayPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfer descuento */}
          {hasTransfer && (
            <div className="bg-[#D4FF00]/[0.06] border border-[#D4FF00]/20 rounded-xl p-4">
              <p className="text-[#D4FF00] font-black text-sm mb-1">20% de descuento por transferencia</p>
              <p className="text-2xl font-black text-white">{formatPrice(transferPrice)}</p>
              <p className="text-[#A1A1AA] text-xs mt-1">El descuento se aplica al confirmar el pago por transferencia</p>
            </div>
          )}

          {/* Por grupo */}
          {groups.map((group) => {
            const groupMethods = methods.filter((m) => PAYMENT_CATALOG[m]?.group === group);
            if (groupMethods.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs font-black uppercase tracking-widest text-[#A1A1AA] mb-3">{PAYMENT_GROUP_LABELS[group]}</p>
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {groupMethods.map((key) => (
                      <span
                        key={key}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${PAYMENT_CATALOG[key]?.color ?? 'bg-white/10 text-white border-white/20'}`}
                      >
                        {PAYMENT_CATALOG[key]?.label ?? key}
                      </span>
                    ))}
                  </div>
                  {group === 'transfer' && (
                    <p className="text-[#D4FF00] text-xs font-semibold">Total: {formatPrice(transferPrice)}</p>
                  )}
                  {group !== 'transfer' && (
                    <p className="text-[#A1A1AA] text-xs">Total: {formatPrice(displayPrice)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function ProductoPage() {
  const params  = useParams<{ slug: string }>();
  const router  = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product,          setProduct]          = useState<Product | null>(null);
  const [related,          setRelated]          = useState<Product[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [selImg,           setSelImg]           = useState(0);
  const [quantity,         setQuantity]         = useState(1);
  const [wished,           setWished]           = useState(false);
  const [added,            setAdded]            = useState(false);
  const [postal,           setPostal]           = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const relScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);
    Promise.allSettled([
      getProduct(params.slug),
      getFeaturedProducts(),
    ]).then(([prodRes, relRes]) => {
      const p = prodRes.status === 'fulfilled' ? (prodRes.value?.data ?? prodRes.value) : null;
      setProduct(p ?? null);  // sin mock de fallback — si no existe el producto, mostrar página not found
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

  // ── Valores derivados
  const hasDiscount   = product.salePrice !== undefined && product.salePrice > 0 && product.salePrice < product.price;
  const discountPct   = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;
  const displayPrice  = hasDiscount ? product.salePrice! : product.price;
  const images        = product.images.length > 0 ? product.images : [];
  const cuota         = Math.ceil(displayPrice / 9);
  // transferPrice: usar el valor del backoffice si está configurado, si no calcular 80%
  const transferPrice = product.transferPrice && product.transferPrice > 0
    ? product.transferPrice
    : Math.ceil(displayPrice * 0.8);
  const embedUrl      = getVideoEmbedUrl(product.videoUrl);

  // Parsear campos JSON de la DB — solo se muestran si el admin los configuró
  const performanceStats: PerformanceStat[] = (() => {
    const raw = product.performanceStats;
    if (!raw || !Array.isArray(raw) || raw.length === 0) return [];
    return raw as PerformanceStat[];
  })();

  const features: Feature[] = (() => {
    const raw = product.features;
    if (!raw || !Array.isArray(raw) || raw.length === 0) return [];
    return raw as Feature[];
  })();

  const highlights: string[] = (() => {
    const raw = product.highlights;
    if (!raw || !Array.isArray(raw) || raw.length === 0) return [];
    return raw.filter((h): h is string => typeof h === 'string');
  })();

  const paymentMethods: string[] = (() => {
    const raw = product.paymentMethods;
    if (!raw || !Array.isArray(raw) || raw.length === 0) return [];
    return raw.filter((m): m is string => typeof m === 'string');
  })();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* Modal de medios de pago */}
      {showPaymentModal && paymentMethods.length > 0 && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          methods={paymentMethods}
          displayPrice={displayPrice}
          transferPrice={transferPrice}
        />
      )}

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

            {/* Miniaturas verticales — solo si hay más de 1 imagen */}
            {images.length > 1 && (
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen principal */}
            <div className="flex-1 aspect-square bg-[#121212] rounded-2xl border border-white/[0.08] overflow-hidden relative group">
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(images[selImg] ?? images[0])}
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

              {/* Flechas de navegación — solo si hay más de 1 imagen */}
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

            {/* Precios — lógica corregida: displayPrice = salePrice SOLO si es menor que price */}
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
              <p className="text-[#D4FF00] text-sm font-semibold">
                {formatPrice(transferPrice)} con Transferencia o depósito
              </p>
              <div className="flex items-center gap-1.5 text-[#A1A1AA] text-sm">
                <span className="text-white font-bold">9 cuotas sin interés</span>
                <span>de {formatPrice(cuota)}</span>
              </div>
              {paymentMethods.length > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-white text-xs underline underline-offset-2 transition-colors w-fit"
                >
                  <CreditCard size={12} />
                  Ver más detalles
                </button>
              )}
            </div>

            {/* Stock crítico */}
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

            {/* Selector de cantidad */}
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
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full py-4 rounded-xl bg-[#D4FF00] text-[#111] font-black text-sm uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                COMPRAR AHORA
              </button>

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

      {/* ══ RENDIMIENTO — solo si el admin configuró los datos en el backoffice ══ */}
      {performanceStats.length > 0 && (
        <section className="border-t border-white/[0.06] py-14">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
              RENDIMIENTO DE UN VISTAZO
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceStats.map((s) => (
                <PerformanceBar key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CARACTERÍSTICAS — solo si el admin configuró los datos en el backoffice ══ */}
      {features.length > 0 && (
        <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-8">
              CARACTERÍSTICAS PRINCIPALES
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {features.map((f) => (
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
      )}

      {/* ══ VIDEO — solo si tiene videoUrl válido de YouTube o Vimeo ════════════ */}
      {embedUrl && (
        <section className="border-t border-white/[0.06] py-14">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6">
              VIDEO DEL PRODUCTO
            </h2>
            <div className="max-w-2xl">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/[0.08]">
                <iframe
                  src={embedUrl}
                  title="Video del producto"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ DESCRIPCIÓN + DESTACADOS — side-by-side si ambos existen ═════════ */}
      {(product.description?.trim() || highlights.length > 0) && (
        <section className="border-t border-white/[0.06] py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className={`grid grid-cols-1 ${product.description?.trim() && highlights.length > 0 ? 'lg:grid-cols-2' : ''} gap-10`}>
              {/* Descripción — solo si existe */}
              {product.description?.trim() && (
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6">
                    ¿POR QUÉ ELEGIR ESTE PRODUCTO?
                  </h2>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Destacados — solo si existen */}
              {highlights.length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6">
                    DESTACADOS
                  </h2>
                  <ul className="space-y-2.5">
                    {highlights.map((text, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                        <span className="w-4 h-4 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center flex-none mt-0.5">
                          <Check size={10} className="text-[#D4FF00]" />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ PRODUCTOS RELACIONADOS — datos reales de la API ══════════════════ */}
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
                  const relDiscount = p.salePrice !== undefined && p.salePrice > 0 && p.salePrice < p.price;
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
                          {formatPrice(relDiscount ? p.salePrice! : p.price)}
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

      {/* ══ TRUST BOTTOM ═════════════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: <Truck size={22} />,        title: 'ENVÍOS A TODO EL PAÍS',    sub: 'Recibí tu pedido en cualquier punto del país' },
              { icon: <RefreshCw size={22} />,     title: '30 DÍAS PARA CAMBIOS',     sub: 'Si no estás conforme, podés cambiar tu producto' },
              { icon: <Shield size={22} />,        title: 'GARANTÍA OFICIAL',         sub: 'Todos nuestros productos cuentan con garantía oficial' },
              { icon: <Check size={22} />,         title: 'PAGOS 100% SEGUROS',       sub: 'Protegemos tus datos con el más alto nivel de seguridad' },
              { icon: <MessageCircle size={22} />, title: 'ATENCIÓN PERSONALIZADA',   sub: 'Te asesoramos por WhatsApp en todo momento' },
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
