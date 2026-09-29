/**
 * Única regla de "qué precio vale" en todo el sistema. La usa PricingService
 * para calcular lo que se cobra y ProductsService para exponerlo en la API
 * — así el frontend no vuelve a reimplementar esta validación por su cuenta
 * (antes lo hacía en 7 lugares distintos, algunos sin chequear `salePrice > 0`,
 * lo que mostraba $0 cuando un producto tenía un `salePrice` de 0 cargado).
 */
export function effectivePrice(price: number, salePrice?: number | null): number {
  const hasValidSale = salePrice != null && salePrice > 0 && salePrice < price;
  return hasValidSale ? salePrice : price;
}

/**
 * Precio de un producto pagando por transferencia: el "Precio
 * transferencia/depósito" del backoffice, si está cargado y es menor que el
 * precio vigente. Si no (vacío, cero o mayor que una promo), el vigente.
 * Es el mismo criterio con el que la tienda lo muestra.
 */
export function precioPorTransferencia(price: number, salePrice?: number | null, transferPrice?: number | null): number {
  const vigente = effectivePrice(price, salePrice);
  const transferencia = Number(transferPrice);
  return Number.isFinite(transferencia) && transferencia > 0 && transferencia < vigente ? transferencia : vigente;
}
