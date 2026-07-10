'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ruler } from 'lucide-react';
import { getProduct, getFeaturedProducts } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductPrice from './components/ProductPrice';
import ProductActions from './components/ProductActions';
import ShippingCalc from './components/ShippingCalc';
import TrustBadges from './components/TrustBadges';
import StockAlert from './components/StockAlert';
import TrustBottom from './components/TrustBottom';
import RelatedProducts from './components/RelatedProducts';
import PaymentModal from './components/PaymentModal';
import ProductStars from './components/ProductStars';
import PerformanceSection from './components/PerformanceSection';
import HighlightsSection from './components/HighlightsSection';
import VideoSection from './components/VideoSection';
import ProductReviews from './components/ProductReviews';
import CompareModels from './components/CompareModels';
import OverallCustomerOpinions from './components/OverallCustomerOpinions';

export default function ProductoPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);
    Promise.allSettled([getProduct(params.slug), getFeaturedProducts()])
      .then(([prodRes, relRes]) => {
        const p = prodRes.status === 'fulfilled' ? (prodRes.value?.data ?? prodRes.value) : null;
        setProduct(p ?? null);
        if (relRes.status === 'fulfilled') {
          const all: Product[] = Array.isArray(relRes.value) ? relRes.value : (relRes.value as any)?.data ?? [];
          setRelated(all.filter((x) => x.slug !== params.slug).slice(0, 6));
        }
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = () => { if (!product) return; addItem(product, quantity); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  const handleBuyNow = () => { if (!product) return; addItem(product, quantity); router.push('/carrito'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050606] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-white/[0.04] rounded-2xl" />
          <div className="space-y-4"><div className="h-3 bg-white/[0.06] rounded w-1/4" /><div className="h-8 bg-white/[0.06] rounded w-3/4" /><div className="h-12 bg-white/[0.06] rounded w-1/2" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050606] flex items-center justify-center">
        <div className="text-center"><p className="text-[#C7C7C0] mb-4">Producto no encontrado</p><Link href="/catalogo" className="text-[#B7D31A] font-semibold underline">Volver al catalogo</Link></div>
      </div>
    );
  }

  const hasDiscount = product.salePrice !== undefined && product.salePrice > 0 && product.salePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.salePrice!) : 0;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const images = product.images?.length > 0 ? product.images : [];
  const cuota = Math.ceil(displayPrice / 9);
  const transferPrice = product.transferPrice && product.transferPrice > 0 ? product.transferPrice : Math.ceil(displayPrice * 0.8);
  const paymentMethods: string[] = Array.isArray(product.paymentMethods) ? product.paymentMethods.filter((m): m is string => typeof m === 'string') : [];
  const performanceStats = Array.isArray(product.performanceStats) ? product.performanceStats : [];
  const highlights = Array.isArray(product.highlights) ? product.highlights.filter((h): h is string => typeof h === 'string') : [];

  const getVideoEmbedUrl = (url?: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1] + '?rel=0&modestbranding=1';
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return 'https://player.vimeo.com/video/' + vimeoMatch[1] + '?dnt=1';
    return url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/') ? url : null;
  };
  const embedUrl = getVideoEmbedUrl(product.videoUrl);

  return (
    <div className="min-h-screen bg-[#050606] text-[#F7F6F7]">
      {showPaymentModal && paymentMethods.length > 0 && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} methods={paymentMethods} displayPrice={displayPrice} transferPrice={transferPrice} />
      )}

      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
          <Link href="/catalogo" className="hover:text-[#F7F6F7] transition-colors">Catalogo</Link><span>/</span>
          <Link href={'/catalogo?marca=' + product.brand.slug} className="hover:text-[#F7F6F7] transition-colors">{product.brand.name}</Link><span>/</span>
          <span className="text-[#F7F6F7] truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">
          <ProductGallery images={images} productName={product.name} hasDiscount={hasDiscount} discountPct={discountPct} isNew={product.isNew || false} />

          <div className="flex flex-col gap-5 bg-[#0C0C0C] rounded-2xl p-6 border border-[#0D0F0F]">
            <ProductInfo brandName={product.brand.name} brandSlug={product.brand.slug} productName={product.name} />
            <ProductStars rating={4} count={0} />
            <ProductPrice displayPrice={displayPrice} transferPrice={transferPrice} hasDiscount={hasDiscount} originalPrice={product.price} cuota={cuota} paymentMethods={paymentMethods} onShowPaymentModal={() => setShowPaymentModal(true)} />
            <StockAlert stock={product.stock} />
            <div className="h-px bg-[#0D0F0F]" />
            <TrustBadges />
            <ProductActions stock={product.stock} quantity={quantity} onQuantityChange={setQuantity} onBuyNow={handleBuyNow} onAddToCart={handleAddToCart} added={added} wished={wished} onWish={() => setWished(!wished)} />
            <Link href="/talles" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1F21] border border-[#0D0F0F] rounded-lg text-[#B7D31A] text-xs font-semibold hover:border-[#B7D31A]/50 transition-all w-fit">
              <Ruler size={14} />Guia de talles
            </Link>
            <ShippingCalc />
            <p className="text-[10px] text-[#8A8A85]">SKU: {product.sku}</p>
          </div>
        </div>
      </div>

      <PerformanceSection stats={performanceStats} specs={[]} />

      {(embedUrl || highlights.length > 0) && (
        <section className="border-t border-[#0D0F0F] py-6">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
              <VideoSection embedUrl={embedUrl} />
              <HighlightsSection highlights={highlights} />
            </div>
          </div>
        </section>
      )}

      <CompareModels />

      <section className="border-t border-[#0D0F0F] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-6">
            LO QUE DICEN NUESTROS CLIENTES
          </h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[30%] flex-shrink-0">
              <OverallCustomerOpinions averageRating={4.5} totalReviews={30595} distribution={[
                { stars: 5, count: 24000, percentage: 78 },
                { stars: 4, count: 4500, percentage: 15 },
                { stars: 3, count: 1200, percentage: 4 },
                { stars: 2, count: 500, percentage: 2 },
                { stars: 1, count: 395, percentage: 1 },
              ]} />
            </div>
            <div className="flex-1 min-w-0">
              <ProductReviews reviews={[]} />
            </div>
          </div>
        </div>
      </section>

      <RelatedProducts products={related} />

      <TrustBottom />
    </div>
  );
}