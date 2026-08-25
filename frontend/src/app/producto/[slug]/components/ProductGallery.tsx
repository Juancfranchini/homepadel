'use client';

import { useState } from 'react';
import { getImageUrl } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  return (
    <>
      <div className="flex gap-3">
        {/* Thumbnails verticales con hover */}
        {thumbnails.length > 1 && (
          <div className="flex flex-col gap-2 flex-shrink-0" style={{ width: '64px' }}>
            {thumbnails.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                onMouseEnter={() => setHoveredImg(i)}
                onMouseLeave={() => setHoveredImg(null)}
                className={'w-[64px] h-[64px] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ' +
                  (selectedImg === i
                    ? 'border-[#B7D31A] shadow-[0_0_12px_rgba(183,211,26,0.3)]'
                    : hoveredImg === i
                    ? 'border-[#B7D31A] shadow-[0_0_8px_rgba(183,211,26,0.2)]'
                    : 'border-[#B7D31A]/40 hover:border-[#B7D31A]/70')}
              >
                <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}

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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>

          {/* Flecha izquierda */}
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10 disabled:opacity-30"
            disabled={thumbnails.length <= 1}
            aria-label="Anterior"
          >
            <ChevronLeft size={26} />
          </button>

          {/* Imagen */}
          <div className="max-w-5xl max-h-[85vh] px-20" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(thumbnails[lightboxIndex])}
              alt={productName}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>

          {/* Flecha derecha */}
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10 disabled:opacity-30"
            disabled={thumbnails.length <= 1}
            aria-label="Siguiente"
          >
            <ChevronRight size={26} />
          </button>

          {/* Contador */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {thumbnails.length}
          </div>

          {/* Thumbnails en el lightbox */}
          {thumbnails.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
              {thumbnails.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={'w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ' +
                    (lightboxIndex === i ? 'border-[#B7D31A]' : 'border-white/20 hover:border-white/50')}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}