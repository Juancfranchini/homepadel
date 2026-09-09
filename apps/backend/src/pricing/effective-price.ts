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
