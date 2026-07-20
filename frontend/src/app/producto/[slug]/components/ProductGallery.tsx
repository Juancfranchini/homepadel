'use client';

import { useState } from 'react';
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
  const thumbnails = images.slice(0, 5);

  return (
    <div className="flex gap-3">
      {thumbnails.length > 1 && (
        <div className="flex flex-col gap-2 flex-shrink-0" style={{ width: '64px' }}>
          {thumbnails.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelImg(i)}
              className={'w-[64px] h-[64px] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ' +
                (selImg === i
                  ? 'border-[#B7D31A] shadow-[0_0_12px_rgba(183,211,26,0.3)]'
                  : 'border-[#B7D31A]/40 hover:border-[#B7D31A]/70')}
            >
              <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 aspect-square bg-[#0C0C0C] rounded-2xl border border-[#0D0F0F] overflow-hidden relative">
        {images.length > 0 ? (
          <img
            src={getImageUrl(images[selImg] ?? images[0])}
            alt={productName}
            className="w-full h-full object-contain p-8"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span className="text-6xl font-bold text-white/[0.06]">
              {productName.split(' ').slice(0, 2).map((w) => w[0]).join('')}
            </span>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hasDiscount && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-{discountPct}%</span>}
          {isNew && <span className="bg-[#B7D31A] text-[#050606] text-xs font-bold px-3 py-1 rounded-full">NUEVO</span>}
        </div>
      </div>
    </div>
  );
}
