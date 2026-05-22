// Utilidades globales del proyecto
// Incluye formateo de precios en ARS, cálculo de descuentos y resolución de URLs de imágenes

/**
 * Formatea un número como precio en pesos argentinos.
 * Ejemplo: 15000 → "$15.000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calcula el porcentaje de descuento entre precio original y precio de oferta.
 * Ejemplo: getDiscountPercent(10000, 8000) → 20
 */
export function getDiscountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Resuelve la URL completa de una imagen.
 * Si ya es absoluta (http/https), la devuelve tal cual.
 * Si es una ruta relativa, le prepend la base URL del backend.
 */
export function getImageUrl(path: string): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${path}`;
}
