import { CartItem, Product } from '@/types';

type InstallmentProduct = Pick<Product, 'effectivePrice' | 'installments' | 'hasInstallmentsInterest' | 'installmentsInterest'>;

export interface InstallmentTerms {
  count: number;
  amount: number;
  interestText: string;
}

export function getInstallmentTerms(product: InstallmentProduct): InstallmentTerms | null {
  const count = Number(product.installments || 0);
  if (!Number.isInteger(count) || count <= 0) return null;
  const interest = product.hasInstallmentsInterest ? Math.max(0, Number(product.installmentsInterest || 0)) : 0;
  const financedTotal = product.effectivePrice * (1 + interest / 100);
  return {
    count,
    amount: Math.ceil(financedTotal / count),
    interestText: interest > 0 ? `con ${interest}% de interés` : 'sin interés',
  };
}

export function formatDiscountPercent(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

/**
 * Precio pagando por transferencia: el cargado en el backoffice, si es menor
 * que el precio vigente. Mismo criterio que el servidor
 * (precioPorTransferencia), que es el que lo cobra.
 */
export function getTransferPrice(product: Pick<Product, 'effectivePrice' | 'transferPrice'>): number | null {
  const precio = Number(product.transferPrice);
  return Number.isFinite(precio) && precio > 0 && precio < product.effectivePrice ? precio : null;
}

/** Subtotal del carrito pagando por transferencia. */
export function subtotalConTransferencia(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + (getTransferPrice(i.product) ?? i.product.effectivePrice) * i.quantity, 0);
}
