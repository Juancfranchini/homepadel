import { Product } from '@/types';
import { getDiscountPercent } from '@/lib/utils';

function getVideoEmbedUrl(url?: string) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1] + '?rel=0&modestbranding=1';
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return 'https://player.vimeo.com/video/' + vimeoMatch[1] + '?dnt=1';
  return url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/') ? url : null;
}

export function deriveProductDisplay(product: Product, selectedVariant: any, activeProductVariants: any[]) {
  const hasDiscount = !product.isMadeToOrder && product.effectivePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercent(product.price, product.effectivePrice) : 0;
  const displayPrice = product.isMadeToOrder ? product.price : product.effectivePrice;

  const images = selectedVariant?.imageUrl
    ? [selectedVariant.imageUrl, ...(selectedVariant.images || [])]
    : (product.images?.length > 0 ? product.images : []);

  const effectiveStock = selectedVariant
    ? selectedVariant.stock
    : activeProductVariants.length > 0
      ? 0
      : product.stock;

  const installments = product.installments || 0;
  const hasInstallmentsInterest = product.hasInstallmentsInterest || false;
  const installmentsInterest = product.installmentsInterest || 0;
  const cuota = installments > 0 ? Math.ceil((displayPrice * (1 + (hasInstallmentsInterest ? installmentsInterest / 100 : 0))) / installments) : 0;
  const transferPrice = product.transferPrice && product.transferPrice > 0 ? product.transferPrice : 0;
  const paymentMethods: string[] = Array.isArray(product.paymentMethods) ? product.paymentMethods.filter((m): m is string => typeof m === 'string') : [];
  const performanceStats = Array.isArray(product.performanceStats) ? product.performanceStats : [];
  const highlights = Array.isArray(product.highlights) ? product.highlights.filter((h): h is string => typeof h === 'string') : [];
  const specs = (product as any).specs || [];
  const relatedVideos = (product as any).relatedVideos || [];
  const compareData = (product as any).compareData || null;
  const highlightsTitle = (product as any).highlightsTitle || '';
  const highlightsDescription = (product as any).highlightsDescription || '';
  const showVideo = (product as any).showVideo !== false;
  const showPerformance = (product as any).showPerformance !== false;
  const showHighlights = (product as any).showHighlights !== false;
  const showCompare = (product as any).showCompare !== false;
  const showRelated = (product as any).showRelated !== false;
  const embedUrl = getVideoEmbedUrl(product.videoUrl);

  return {
    hasDiscount, discountPct, displayPrice, images, effectiveStock,
    installments, hasInstallmentsInterest, installmentsInterest, cuota, transferPrice,
    paymentMethods, performanceStats, highlights, specs, relatedVideos, compareData,
    highlightsTitle, highlightsDescription, showVideo, showPerformance, showHighlights,
    showCompare, showRelated, embedUrl,
  };
}
