import { Product } from '@/types';
import { getDiscountPercent } from '@/lib/utils';

export interface VideoIncrustado {
  url: string;
  /** Los Shorts y TikTok son verticales: en un marco 16:9 quedan con bandas negras. */
  vertical: boolean;
}

/**
 * Convierte el enlace que se pega en el backoffice en uno reproducible.
 *
 * Contempla las formas en que se comparte un video hoy: de YouTube, además de
 * `watch?v=` y `youtu.be`, los **Shorts** —que es lo que da el botón
 * "Compartir" desde el celular— y los directos; de TikTok, el enlace de un
 * video; y Vimeo.
 *
 * TikTok no se puede resolver desde los enlaces cortos `vm.tiktok.com`: son
 * redirecciones que solo se siguen desde un servidor. Hay que pegar el enlace
 * largo, el que trae `/video/`.
 */
function getVideoEmbedUrl(url?: string): VideoIncrustado | null {
  if (!url) return null;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) {
    return {
      url: 'https://www.youtube.com/embed/' + yt[1] + '?rel=0&modestbranding=1',
      vertical: url.includes('/shorts/'),
    };
  }

  const tiktok = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d{6,})/);
  if (tiktok) {
    return { url: 'https://www.tiktok.com/embed/v2/' + tiktok[1], vertical: true };
  }

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return { url: 'https://player.vimeo.com/video/' + vimeo[1] + '?dnt=1', vertical: false };
  }

  const yaIncrustable =
    url.includes('youtube.com/embed/') ||
    url.includes('youtube-nocookie.com/embed/') ||
    url.includes('player.vimeo.com/');
  return yaIncrustable ? { url, vertical: false } : null;
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
  const video = getVideoEmbedUrl(product.videoUrl);
  const embedUrl = video?.url ?? null;
  const embedVertical = video?.vertical ?? false;

  return {
    hasDiscount, discountPct, displayPrice, images, effectiveStock,
    installments, hasInstallmentsInterest, installmentsInterest, cuota, transferPrice,
    paymentMethods, performanceStats, highlights, specs, relatedVideos, compareData,
    highlightsTitle, highlightsDescription, showVideo, showPerformance, showHighlights,
    showCompare, showRelated, embedUrl, embedVertical,
  };
}
