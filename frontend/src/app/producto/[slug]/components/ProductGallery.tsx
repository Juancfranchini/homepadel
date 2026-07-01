'use client';

import { useState } from 'react';


import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface Props {
  images: string[];
  productName: string;
  hasDiscount: boolean;
  discountPct: number;
  isNew: boolean;
}

export default function ProductGallery({ images, productName, hasDiscount, discountPct, isNew }: Props) {
  const [selImg, setSelImg] = useState(0);

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-[60px] flex-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelImg(i)}
              className={'w-[60px] h-[60px] rounded-lg overflow-hidden border transition-all ' +
                (selImg === i
                  ? 'border-[#B7D31A] shadow-[0_0_12px_rgba(183,211,26,0.25)]'
                  : 'border-[#0D0F0F] hover:border-[#8A8A85]')
              }
            >
              <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 aspect-square bg-[#0C0C0C] rounded-2xl border border-[#0D0F0F] overflow-hidden relative group">
        {images.length > 0 ? (
          <img
            src={getImageUrl(images[selImg] ?? images[0])}
            alt={productName}
            className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span className="text-6xl font-bold text-white/[0.06]">
              {productName.split(' ').slice(0, 2).map((w) => w[0]).join('')}
            </span>
            <span className="text-xs text-[#8A8A85] text-center px-8">{productName}</span>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-{discountPct}%</span>
          )}
          {isNew && (
            <span className="bg-[#B7D31A] text-[#050606] text-xs font-bold px-3 py-1 rounded-full">NUEVO</span>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button onClick={() => setSelImg((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-[#0D0F0F] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setSelImg((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-[#0D0F0F] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}