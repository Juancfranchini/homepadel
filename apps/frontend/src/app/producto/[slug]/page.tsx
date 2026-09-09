'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProductoData } from './useProductoData';
import { ProductoSkeleton, ProductoLoadError, ProductoNotFound } from './ProductoLoadingStates';
import { useProductVariants } from './useProductVariants';
import { useProductoActions } from './useProductoActions';
import { deriveProductDisplay } from './deriveProductDisplay';
import ProductGallery from './components/ProductGallery';
import ProductInfoColumn from './ProductInfoColumn';
import PaymentModal from './components/PaymentModal';
import PerformanceSection from './components/PerformanceSection';
import ProductVideoHighlightsSection from './ProductVideoHighlightsSection';
import CompareModels from './components/CompareModels';
import ProductReviewsSection from './ProductReviewsSection';
import RelatedProducts from './components/RelatedProducts';
import TrustBottom from './components/TrustBottom';

export default function ProductoPage() {
  const params = useParams<{ slug: string }>();
  const { product, related, loading, error, retry, hasSizeGuide } = useProductoData(params.slug);
  const variants = useProductVariants(product);
  const actions = useProductoActions(product, variants.selectedVariant, variants.activeProductVariants);

  if (loading) return <ProductoSkeleton />;
  if (error) return <ProductoLoadError onRetry={retry} />;
  if (!product) return <ProductoNotFound />;

  const display = deriveProductDisplay(product, variants.selectedVariant, variants.activeProductVariants);

  return (
    <div className="min-h-screen bg-[#050606] text-[#F7F6F7]">
      {actions.showPaymentModal && display.paymentMethods.length > 0 && (
        <PaymentModal onClose={() => actions.setShowPaymentModal(false)} methods={display.paymentMethods} displayPrice={display.displayPrice} transferPrice={display.transferPrice} />
      )}

      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
          <Link href="/catalogo" className="hover:text-[#F7F6F7] transition-colors">Catálogo</Link><span>/</span>
          <Link href={'/catalogo?marca=' + product.brand.slug} className="hover:text-[#F7F6F7] transition-colors">{product.brand.name}</Link><span>/</span>
          <span className="text-[#F7F6F7] truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 xl:gap-16">
          <ProductGallery images={display.images} productName={product.name} hasDiscount={display.hasDiscount} discountPct={display.discountPct} isNew={product.isNew || false} />
          <ProductInfoColumn
            product={product}
            display={display}
            activeVariants={variants.activeProductVariants}
            variants={variants}
            actions={actions}
            hasSizeGuide={hasSizeGuide}
          />
        </div>
      </div>

      {display.showPerformance && <PerformanceSection stats={display.performanceStats} specs={display.specs} />}

      <ProductVideoHighlightsSection
        showVideo={display.showVideo}
        showHighlights={display.showHighlights}
        embedUrl={display.embedUrl}
        relatedVideos={display.relatedVideos}
        highlights={display.highlights}
        highlightsTitle={display.highlightsTitle}
        highlightsDescription={display.highlightsDescription}
      />

      {display.showCompare && <CompareModels data={display.compareData} />}

      {(product.reviewCount || 0) > 0 && <ProductReviewsSection productId={product.id} />}

      {display.showRelated && <RelatedProducts products={related} />}

      <TrustBottom />
    </div>
  );
}
