'use client';

import { getImageUrl } from '@/lib/utils';

interface Props {
  thumbnails: string[];
  selectedImg: number;
  hoveredImg: number | null;
  onSelect: (i: number) => void;
  onHover: (i: number | null) => void;
}

/**
 * Miniaturas de la galería, en una fila debajo de la foto principal.
 *
 * Antes iban en una columna al costado: le comían ancho a la imagen y dejaban
 * un hueco vertical largo debajo, porque la columna de compra es bastante más
 * alta. Abajo y en cuadrados chicos ocupan ese espacio y la foto principal se
 * lleva todo el ancho.
 */
export default function ProductGalleryThumbnails({ thumbnails, selectedImg, hoveredImg, onSelect, onHover }: Props) {
  if (thumbnails.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {thumbnails.map((img, i) => {
        const activa = selectedImg === i;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            aria-label={'Ver imagen ' + (i + 1)}
            aria-current={activa}
            className={
              'h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-[#0C0C0C] transition-all ' +
              (activa
                ? 'border-[#B7D31A] shadow-[0_0_12px_rgba(183,211,26,0.3)]'
                : hoveredImg === i
                ? 'border-[#B7D31A] shadow-[0_0_8px_rgba(183,211,26,0.2)]'
                : 'border-[#1A1F21] hover:border-[#B7D31A]/70')
            }
          >
            <img src={getImageUrl(img)} alt="" className="h-full w-full object-contain p-1" />
          </button>
        );
      })}
    </div>
  );
}
