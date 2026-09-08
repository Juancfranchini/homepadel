'use client';

import { useState } from 'react';
import { getImageUrl } from '@/lib/utils';
import ProductGalleryLightbox from './ProductGalleryLightbox';
import ProductGalleryThumbnails from './ProductGalleryThumbnails';

interface Props {
  images: string[];
  productName: string;
  hasDiscount: boolean;
  discountPct: number;
  isNew: boolean;
}

export default function ProductGallery({ images, productName, hasDiscount, discountPct, isNew }: Props) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const thumbnails = images.slice(0, 5);

  const currentImageIndex = hoveredImg !== null ? hoveredImg : selectedImg;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % thumbnails.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + thumbnails.length) % thumbnails.length);
  };

  return (
    <>
      <div className="flex gap-3">
        <ProductGalleryThumbnails thumbnails={thumbnails} selectedImg={selectedImg} hoveredImg={hoveredImg} onSelect={setSelectedImg} onHover={setHoveredImg} />

        {/* Imagen principal - click para abrir lightbox */}
        <div 
          className="flex-1 aspect-square bg-[#0C0C0C] rounded-2xl border border-[#0D0F0F] overflow-hidden relative cursor-zoom-in"
          onClick={() => thumbnails.length > 0 && openLightbox(currentImageIndex)}
        >
          {images.length > 0 ? (
            <img
              src={getImageUrl(images[currentImageIndex] ?? images[0])}
              alt={productName}
              className="w-full h-full object-contain p-8 transition-opacity duration-200"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="text-6xl font-bold text-white/[0.06]">
                {productName.split(' ').slice(0, 2).map((w) => w[0]).join('')}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasDiscount && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-{discountPct % 1 === 0 ? discountPct.toFixed(0) : discountPct.toFixed(1)}%</span>}
            {isNew && <span className="bg-[#B7D31A] text-[#050606] text-xs font-bold px-3 py-1 rounded-full">NUEVO</span>}
          </div>

          {/* Indicador zoom */}
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm font-bold">
            +
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <ProductGalleryLightbox
          thumbnails={thumbnails}
          productName={productName}
          lightboxIndex={lightboxIndex}
          onSelectIndex={setLightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  );
}