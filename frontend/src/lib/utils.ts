// Funciones utilitarias del frontend

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '$ 0';
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Calcula el porcentaje de descuento entre dos precios.
 * Ejemplo: getDiscountPercent(10000, 8000) -> 20
 */
export function getDiscountPercent(original: number, sale: number): number {
  const percent = ((original - sale) / original) * 100;
  return Math.round(percent * 10) / 10;
}

/**
 * Resuelve la URL completa de una imagen.
 * Si es base64 (data:), la devuelve tal cual.
 * Si ya es absoluta (http/https), la devuelve tal cual.
 * Si es una ruta relativa, le prepend la base URL del backend.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http')) return path;
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + path;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
