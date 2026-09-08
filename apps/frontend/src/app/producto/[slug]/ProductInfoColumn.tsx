'use client';

import Link from 'next/link';
import { Ruler } from 'lucide-react';
import { Product } from '@/types';
import ProductInfo from './components/ProductInfo';
import ProductStars from './components/ProductStars';
import ProductPrice from './components/ProductPrice';
import StockAlert from './components/StockAlert';
import TrustBadges from './components/TrustBadges';
import VariantSelector from './components/VariantSelector';
import ProductActions from './components/ProductActions';
import ShippingCalc from './components/ShippingCalc';
import { deriveProductDisplay } from './deriveProductDisplay';
import { useProductVariants } from './useProductVariants';
import { useProductoActions } from './useProductoActions';

interface Props {
  product: Product;
  display: ReturnType<typeof deriveProductDisplay>;
  activeVariants: any[];
  variants: ReturnType<typeof useProductVariants>;
  actions: ReturnType<typeof useProductoActions>;
  hasSizeGuide: boolean;
}

export default function ProductInfoColumn({ product, display, activeVariants, variants, actions, hasSizeGuide }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 bg-[#0C0C0C] rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-[#0D0F0F]">
      <ProductInfo brandName={product.brand.name} brandSlug={product.brand.slug} productName={product.name} />
      <ProductStars rating={product.rating || 0} count={product.reviewCount || 0} />
      <ProductPrice
        displayPrice={display.displayPrice} transferPrice={display.transferPrice} hasDiscount={display.hasDiscount}
        originalPrice={product.price} cuota={display.cuota} installments={display.installments}
        hasInstallmentsInterest={display.hasInstallmentsInterest} installmentsInterest={display.installmentsInterest}
        paymentMethods={display.paymentMethods} onShowPaymentModal={() => actions.setShowPaymentModal(true)}
        isMadeToOrder={product.isMadeToOrder} estimatedDays={product.estimatedDays} requiredDeposit={product.requiredDeposit}
      />
      <StockAlert stock={display.effectiveStock} isMadeToOrder={product.isMadeToOrder} estimatedDays={product.estimatedDays} />
      <div className="h-px bg-[#0D0F0F]" />
      <TrustBadges />
      <VariantSelector
        variants={activeVariants}
        selectedColor={variants.selectedColor}
        selectedSize={variants.selectedSize}
        onColorChange={variants.setSelectedColor}
        onSizeChange={variants.setSelectedSize}
        selectedDimensions={variants.selectedDimensions}
        onDimensionsChange={variants.setSelectedDimensions}
        selectedWeight={variants.selectedWeight}
        onWeightChange={variants.setSelectedWeight}
        hasSize={!!product.hasSize}
        hasColor={!!product.hasColor}
        hasDimensions={!!product.hasDimensions}
        hasWeight={!!product.hasWeight}
      />
      <ProductActions
        stock={display.effectiveStock} quantity={actions.quantity} onQuantityChange={actions.setQuantity}
        onBuyNow={actions.handleBuyNow} onAddToCart={actions.handleAddToCart} added={actions.added}
        wished={actions.wished} onWish={() => actions.setWished(!actions.wished)}
      />
      {hasSizeGuide && (<Link href="/talles" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1F21] border border-[#0D0F0F] rounded-lg text-[#B7D31A] text-xs font-semibold hover:border-[#B7D31A]/50 transition-all w-fit"><Ruler size={14} />Guia de talles</Link>)}
      <ShippingCalc />
      <p className="text-[10px] text-[#8A8A85]">SKU: {product.sku}</p>
    </div>
  );
}
