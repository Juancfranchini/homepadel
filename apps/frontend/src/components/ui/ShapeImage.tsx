'use client';

import { useShapeImages } from '@/hooks/useShapeImages';

/**
 * Imagen del formato de la paleta, al lado del texto.
 *
 * La carga la tienda desde el backoffice, una por formato: un PNG con fondo
 * transparente de la silueta. Antes se dibujaban íconos genéricos —un rombo,
 * una gota, un círculo— que a ese tamaño no se distinguían entre sí.
 *
 * Si no hay imagen cargada para ese formato, no se muestra nada y queda solo
 * el texto: es mejor que un dibujo que no representa el producto.
 */
export default function ShapeImage({ shape }: { shape: string }) {
  const imagenes = useShapeImages();
  const url = imagenes[shape];

  if (!url) return null;

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      className="h-4 w-4 flex-shrink-0 object-contain"
    />
  );
}
