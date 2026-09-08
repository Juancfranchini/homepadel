'use client';

import { getImageUrl } from '@/lib/utils';

interface Props {
  thumbnails: string[];
  selectedImg: number;
  hoveredImg: number | null;
  onSelect: (i: number) => void;
  onHover: (i: number | null) => void;
}

export default function ProductGalleryThumbnails({ thumbnails, selectedImg, hoveredImg, onSelect, onHover }: Props) {
  if (thumbnails.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2 flex-shrink-0" style={{ width: '64px' }}>
      {thumbnails.map((img, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
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
  );
}
