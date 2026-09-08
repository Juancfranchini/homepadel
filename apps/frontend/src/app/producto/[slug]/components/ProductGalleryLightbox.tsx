'use client';

import { getImageUrl } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  thumbnails: string[];
  productName: string;
  lightboxIndex: number;
  onSelectIndex: (i: number) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ProductGalleryLightbox({ thumbnails, productName, lightboxIndex, onSelectIndex, onClose, onNext, onPrev }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
        aria-label="Cerrar"
      >
        <X size={22} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10 disabled:opacity-30"
        disabled={thumbnails.length <= 1}
        aria-label="Anterior"
      >
        <ChevronLeft size={26} />
      </button>

      <div className="max-w-5xl max-h-[85vh] px-20" onClick={(e) => e.stopPropagation()}>
        <img
          src={getImageUrl(thumbnails[lightboxIndex])}
          alt={productName}
          className="max-w-full max-h-[85vh] object-contain"
        />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10 disabled:opacity-30"
        disabled={thumbnails.length <= 1}
        aria-label="Siguiente"
      >
        <ChevronRight size={26} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
        {lightboxIndex + 1} / {thumbnails.length}
      </div>

      {thumbnails.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {thumbnails.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onSelectIndex(i); }}
              className={'w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ' +
                (lightboxIndex === i ? 'border-[#B7D31A]' : 'border-white/20 hover:border-white/50')}
            >
              <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-0.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
